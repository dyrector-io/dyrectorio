# Contributing

We'd love you to contribute to dyrectorio platform. We want contribution to dyrectorio to be fun, enjoyable, and educational for anyone and everyone. All contributions are welcome, including issues, new docs as well as updates and tweaks, blog posts, workshops, and more.

## How to Start?

If you're worried or don’t know where to start, check out our next section explaining what kind of help we could use and where you can become involved. You can reach out with questions to our [Discord server](https://discord.gg/hMyT9cbYFD) or [@dyrectorio](https://twitter.com/dyrectorio) on Twitter.

## Code of Conduct

Help us keep dyrectorio open and inclusive. Please read and follow our [Code of Conduct](/CODE_OF_CONDUCT.md).

## Submit a Pull Request

Branch naming convention is as following

`TYPE/DESCRIPTION-DESCRIPTION`

When `TYPE` can be:

- `feat/` - a new feature
- `fix/` - a bug fix
- `hotfix/` - a bug fix on main branch
- `doc/` - documentation only changes
- `cicd/` - changes related to CI/CD system
- `refactor/` - code change that neither fixes a bug nor adds a feature

All PRs must include a commit message with the changes described.

dyrectorio is following Conventional Commits, the commit messages should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

The commit contains the following structural elements, to communicate intent to the consumers of dyrectorio library:

1. **fix:** a commit of the _type_ `fix` patches a bug in your codebase (this correlates with [`PATCH`](http://semver.org/#summary) in Semantic Versioning).
1. **feat:** a commit of the _type_ `feat` introduces a new feature to the codebase (this correlates with [`MINOR`](http://semver.org/#summary) in Semantic Versioning).
1. **BREAKING CHANGE:** a commit that has a footer `BREAKING CHANGE:`, or appends a `!` after the type/scope, introduces a breaking API change (correlating with [`MAJOR`](http://semver.org/#summary) in Semantic Versioning).
A BREAKING CHANGE can be part of commits of any _type_.
1. _types_ other than `fix:` and `feat:` are allowed, for example [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) (based on the [the Angular convention](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines)) recommends `build:`, `chore:`,
  `ci:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, and others.
1. _footers_ other than `BREAKING CHANGE: <description>` may be provided and follow a convention similar to
  [git trailer format](https://git-scm.com/docs/git-interpret-trailers).


More info: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#specification).

## Security & Privacy

Security and privacy are extremely important to dyrectorio's core team, its independent developers, and users alike. Make sure to follow the best industry standards and practices.

## Dependencies

Please avoid introducing new dependencies to dyrectorio without consulting the team. New dependencies can be very helpful but also introduce new security and privacy issues, complexity, and impact total docker image size.

Adding a new dependency should provide meaningful value to the product with minimum possible risk.

## Other Ways to Help

Pull requests are great, but there are many other areas where you can help dyrectorio.

### Sending Feedbacks & Reporting Bugs

Sending feedback is a great way for us to understand your different use cases of dyrectorio better. If you had any issues, bugs, or want to share about your experience, feel free to do so on our GitHub issues page or at our [Discord server](https://discord.gg/hMyT9cbYFD).

### Submitting New Ideas

If you think dyrectorio could use a new feature, please open an issue on our GitHub repository, stating as much information as you can think of your new idea and it's implications. We'd also use this issue to gather more information, get more feedback from the community, and have a proper discussion about the new feature.

### Improving Documentation

Submitting documentation updates, enhancements, designs, or bug fixes. Spelling or grammar fixes will be very much appreciated.

### Commit signatures

Submitting pull requests require all commits to be signed with a GPG signature. Refer to the [GitHub documentation](https://docs.github.com/en/authentication/managing-commit-signature-verification) to setup GPG signing.
