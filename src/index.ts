/* eslint no-unused-vars: 0 */
import { Application, Context } from 'probot'
import { Octokit } from '@octokit/rest'

const getConfig = require('probot-config')

export = (app: Application) => {
  app.on(['pull_request.opened', 'pull_request.reopened', 'pull_request.labeled', 'pull_request.edited', 'pull_request_review'], async (context) => {
    // reading configuration
    const config = await getConfig(context, 'autoapproval.yml')
    context.log(config, '\n\nLoaded config')
    context.log('Repo: %s', context.payload.repository.full_name)

    const pr = context.payload.pull_request
    context.log('PR: %s', pr.html_url)
    const prLabels: string[] = pr.labels.map((label: any) => label.name)

    // determine if the PR has any "blacklisted" labels
    var blacklistedLabels: string[] = []
    if (config.blacklisted_labels) {
      blacklistedLabels = config.blacklisted_labels
        .filter((blacklistedLabel: any) => prLabels.includes(blacklistedLabel))

      // if PR contains any black listed labels, do not proceed further
      if (blacklistedLabels.length > 0) {
        context.log('PR black listed from approving: %s', blacklistedLabels)
        return
      }
    }

    // reading pull request owner info and check it with configuration
    const ownerSatisfied = config.from_owner.length === 0 || config.from_owner.includes(pr.user.login)

    // reading pull request labels and check them with configuration
    const missingRequiredLabels = config.required_labels
      .filter((requiredLabel: any) => !prLabels.includes(requiredLabel))

    if (missingRequiredLabels.length === 0 && ownerSatisfied) {
      const reviews = await getAutoapprovalReviews(context)

      if (reviews.length > 0) {
        context.log('PR has already reviews')
        if (context.payload.action === 'dismissed') {
          approvePullRequest(context)
          applyLabels(context, config.apply_labels as string[])
          context.log('Review was dismissed, approve again')
        }
      } else {
        approvePullRequest(context)
        applyLabels(context, config.apply_labels as string[])
        context.log('PR approved first time')
      }
    } else {
      // one of the checks failed
      context.log('Condition failed! \n - missing required labels: %s\n - PR owner found: %s', missingRequiredLabels, ownerSatisfied)
    }
  })
}

async function approvePullRequest (context: Context) {
  const prParams = context.issue({ event: 'APPROVE', body: 'Approved :+1:' }) as unknown
  await context.github.pulls.createReview(prParams as Octokit.PullsCreateReviewParams)
}

async function applyLabels (context: Context, labels: string[]) {
  // if there are labels required to be added, add them
  if (labels.length > 0) {
    // trying to apply existing labels to PR. If labels didn't exist, this call will fail
    const labelsParam = context.issue({ labels: labels })
    await context.github.issues.addLabels(labelsParam)
  }
}

async function getAutoapprovalReviews (context: Context): Promise<Octokit.PullsListReviewsResponse> {
  const reviewParams = context.issue()
  const reviews = await context.github.pulls.listReviews(reviewParams)

  const autoapprovalReviews = (reviews.data as Octokit.PullsListReviewsResponse)
    .filter((item: any) => item.user.login === 'autoapproval[bot]')

  return autoapprovalReviews
}
