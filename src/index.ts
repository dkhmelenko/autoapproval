import { Application } from 'probot' // eslint-disable-line no-unused-vars
import { PullRequestsCreateReviewParams } from '@octokit/rest'

export = (app: Application) => {
  app.on(['pull_request.opened', 'pull_request.reopened'], async (context) => {
    app.log(context)

    // reading configuration
    const config = await context.config('autoapproval.yml')
    context.log(config, 'Loaded config')

    const pr = context.payload.pull_request

    // reading pull request owner info and check it with configuration
    const prUser = pr.user.login
    const ownerSatisfied = config.from_owner.length == 0 || config.from_owner.includes(prUser)

    // reading pull request labels and check them with configuration
    const prLabels = pr.labels.map((label: any) => label.name)
    const missingRequiredLabels = config.required_labels
      .filter((requiredLabel: any) => !prLabels.includes(requiredLabel))

    if (missingRequiredLabels.length == 0 && ownerSatisfied) {
      const prParams = context.issue({ event: "APPROVE", body: "Approved :+1:" });

      await context.github.pullRequests.createReview(prParams as PullRequestsCreateReviewParams)

      // if there are labels required to be added, add them
      const labelsToAdd = config.apply_labels
      if (labelsToAdd.length > 0) {
        // trying to apply existing labels to PR. If labels ddn't exist, this call will fail
        await context.github.issues.addLabels(context.issue({ labels: labelsToAdd}))
      }

    } else {
      // one of the ckecks failed
      context.log("Condition failed! \n - missing required labels: %s\n - PR owner found: %s", missingRequiredLabels, ownerSatisfied)
    }
  })
}
