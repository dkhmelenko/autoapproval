# autoapproval

A GitHub App built with [Probot](https://github.com/probot/probot) for approving pull requests automatically

## Setup

```sh
# Install dependencies
npm install

# Run typescript
npm run build

# Run the bot
npm start
```

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

### apply_labels
Defines the list of labels on PR, which should be added once PR was approved automatically. For example:
```
apply_labels:
  - merge
```
Assign an empty array if no labels should be applied to PRs (example: `apply_labels: []`).

_NOTE_: If label doesn't exist, it will not be created. In order to apply the label after approving PR automatically, you need to define the label beforehand.

## Contributing

If you have suggestions for how autoapproval could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2018 Dmytro Khmelenko <d.khmelenko@gmail.com> (dkhmelenko.github.io)
