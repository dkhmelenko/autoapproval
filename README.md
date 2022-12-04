# autoapproval

[![Build Status](https://github.com/dkhmelenko/autoapproval/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/dkhmelenko/autoapproval/actions?query=branch%3Amaster)
[![codecov](https://codecov.io/gh/dkhmelenko/autoapproval/branch/master/graph/badge.svg)](https://codecov.io/gh/dkhmelenko/autoapproval)

A GitHub App built with [Probot](https://github.com/probot/probot) for approving pull requests automatically

![image](https://user-images.githubusercontent.com/4306809/50573484-13a0a100-0dd5-11e9-8ef3-aad5069e83e3.png)

## Setup

```sh
# Install dependencies
npm install

# Run typescript
npm run build

# Run the bot
npm start

# Run tests, don't forget to run `npm run build` beforehand
npm run test
```

This app requires `Write code` permissions in order not to have issues with approving PRs.
```
Repository administrators can require that all pull requests receive a specific number of approving reviews from people with write or admin permissions in the repository or from a designated code owner before they're merged into a protected branch.

...

You won't be able to merge your pull request until the required number of reviewers with write or admin permissions in the repository approve your pull request's changes in their review.
```

More about it can be found on [Github Help](https://help.github.com/en/articles/about-pull-request-reviews#required-reviews).

### Configure GitHub Action

This application runs on GitHub actions.
Add the following configuration to `.github/workflows/autoapproval.yml
```yaml
on:
  pull_request:
    types: [opened, reopened, labeled, edited]
  pull_request_review:
    types: [dismissed]
  
jobs:
  autoapproval:
    runs-on: ubuntu-latest
    name: Autoapproval
    steps:
      - uses: dkhmelenko/autoapproval@v1.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Configuration

In order to use the bot, the config file should be provided. Config file should be defined in your repository. Config file is the yml file with the path `.github/autoapproval.yml`. The file should have at least 3 mandatory entries: `from_owner`, `required_labels` and `apply_labels`.

---

### from_owner
**mandatory**

Defines the list of users, whos pull requests should be approved automatically. For example:
```
from_owner:
  - dkhmelenko
  - quongeri
```
Assign an empty array if you want to approve PRs from any user (example: `from_owner: []`).

---

### required_labels
**mandatory**

Defines the list of labels on PR, which should be present for approving PR automatically. For example:
```
required_labels:
  - ready
```
Assign an empty array if you want to approve PRs without any label (example: `required_labels: []`).

---

### required_labels_mode
Defines the behavior how `required_labels` should be treated.
If nothing specified, then all labels from `required_label` are mandatory.
If the value set to `one_of`, then it's enough to have only of the `required_labels` to get approval.

---

### blacklisted_labels

Defines the list of labels on PR, which will prevent the PR from being automatically approved. For example:
```
blacklisted_labels:
  - wip
```
Assign an empty array if you do not want to blacklist any labels.

---

### apply_labels
**mandatory**

Defines the list of labels on PR, which should be added once PR was approved automatically. For example:
```
apply_labels:
  - merge
```
Assign an empty array if no labels should be applied to PRs (example: `apply_labels: []`).

_NOTES_:
1. If label doesn't exist, it will not be created. In order to apply the label after approving PR automatically, you need to define the label beforehand.
2. If PR already contains a review from this bot, new approval will not happen. Except the case when review was dismissed.

---

### auto_merge_labels / auto_squash_merge_labels / auto_rebase_merge_labels
Defines labels for which the bot should enable auto merging for the pull request.
This will automatically merge the PR after approving it when all checks passed.


The following example with merge PR with the method "Merge" on GitHub:
```
auto_merge_labels:
  - auto-merge
```

You can also use "Squash & Merge" as merge method for a given list of labels:
```
auto_squash_merge_labels:
  - auto-squash-merge
```

The same is true for "Rebase & Merge":
```
auto_rebase_merge_labels:
  - auto-rebase-merge
```

_NOTES_:
- the `Allow auto-merge` setting must be enabled for the repository.
- it is enough to use only one of the options: `auto_merge_labels`, `auto_squash_merge_labels` or `auto_rebase_merge_labels`
- the repository should have enabled the merge method


## Releasing
To release new version of the app, the following steps are required:
1. compile Node.js module into a single file by running the following command
```
ncc build index.js --license licenses.txt
```
2. tag new release and push tags
```
git tag -a -m "New action release" v1.1
git push --tags
```

## Contributing

If you have suggestions for how autoapproval could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2018 [Dmytro Khmelenko](https://dkhmelenko.github.io/)
