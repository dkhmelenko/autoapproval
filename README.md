# autoapproval

[![Build Status](https://travis-ci.org/dkhmelenko/autoapproval.svg?branch=master)](https://travis-ci.org/dkhmelenko/autoapproval)
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

## Configuration

In order to use the bot, the config file should be provided. Config file should be defined in your repository. Config file is the yml file with the path `.github/autoapproval.yml`. The file should have 3 entries.

### from_owner
Defines the list of users, whos pull requests should be approved automatically. For example:
```
from_owner:
  - dkhmelenko
  - quongeri
```
Assign an empty array if you want to approve PRs from any user (example: `from_owner: []`).

### required_labels
Defines the list of labels on PR, which should be present for approving PR automatically. For example:
```
required_labels:
  - ready
```
Assign an empty array if you want to approve PRs without any label (example: `required_labels: []`).

### required_labels_mode
Defines the behavior how `required_labels` should be treated.
If nothing specified, then all labels from `required_label` are mandatory.
If the value set to `one_of`, then it's enough to have only of the `required_labels` to get approval.

### blacklisted_labels
Defines the list of labels on PR, which will prevent the PR from being automatically approved. For example:
```
blacklisted_labels:
  - wip
```
Assign an empty array if you do not want to blacklist any labels.

### apply_labels
Defines the list of labels on PR, which should be added once PR was approved automatically. For example:
```
apply_labels:
  - merge
```
Assign an empty array if no labels should be applied to PRs (example: `apply_labels: []`).

_NOTES_:
1. If label doesn't exist, it will not be created. In order to apply the label after approving PR automatically, you need to define the label beforehand.
2. If PR already contains a review from this bot, new approval will not happen. Except the case when review was dismissed.

### auto_merge_labels
Defines labels for which the bot should enable auto merging for the pull request.
This will automatically merge the PR after approving it when all checks passed.
Note that the `Allow auto-merge` setting must be enabled for the repository.

For example
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

_NOTE_:
- it is enough for one of the labels in the list to be applied to enable auto merging with the respective method

## Contributing

If you have suggestions for how autoapproval could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2018 [Dmytro Khmelenko](https://dkhmelenko.github.io/)
