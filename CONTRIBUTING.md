# Contributing

We'd love you to contribute to [dyrector.io](https://dyrector.io/) platform. We want contribution to dyrector.io to be fun, enjoyable, and educational for anyone and everyone. All contributions are welcome, including issues, new docs as well as updates and tweaks, blog posts, workshops, and more.

## Code of Conduct

Help us keep [dyrector.io](https://dyrector.io/) open and inclusive. Please read and follow our [Code of Conduct](/CODE_OF_CONDUCT.md).

## How to Start?

If you're worried or don’t know where to start, check out our next section explaining what kind of help we could use and where you can become involved. You can reach out with questions to our [Discord server](https://discord.gg/hMyT9cbYFD) or [@dyrectorio](https://twitter.com/dyrectorio) on Twitter.

## Development

1. Run `make upd` in the repo's root folder.

-   Save your `DATABASE_URL=<connection_string>` environment variable for later.

2. Go to the `web/crux` directory: `cd web/crux`
3. Install dependencies `npm ci`
4. Copy the _env.example_ file as _.env_ `cp .env.example .env`

-   Paste `DATABASE_URL=<connection_string>` variable from step 1 to _.env_

5. On Linux:

-   Uncomment the `DNS_DEFAULT_RESULT_ORDER=ipv4first` line in the _.env_ file
-   Change the `CRUX_AGENT_ADDRESS` variable's value to `172.17.0.1:5000`

6. On Mac / Windows you may have to edit your OS's hosts file to be sure the `host.docker.internal` domain resolves to docker's bridge network.

-   Alternatively, you can use your machine's LAN IP.

7. Deploy the database with `npm run prisma:migrate`
8. Start the backend in development mode with `npm start`
9. Go to the `web/crux-ui` directory: `cd web/crux-ui`
10. Install dependencies `npm ci`
11. Copy the _env.example_ file as _.env_ `cp .env.example .env`
12. Start the frontend in development mode with `npm start` but in a different terminal
13. After you navigate to `localhost:8000` (this is the default Traefik port) you will see a Login screen
14. Register an account with whatever e-mail address you see fit (doesn't have to be a valid one)
15. Navigate to `localhost:4436` where you will find your mail as all outgoing e-mails will land here
16. Open your e-mail message and using the link inside you can activate your account
17. Fruitful contributing! 🎬

Read more about the CLI in the [documentation](https://docs.dyrector.io/get-started/cli).

## Testing

Unit tests:

-   In the `web/crux` or `web/crux-ui` folder respectively:

1. Run `npm ci`.
2. Start the tests with `npm run test`.

End-to-end tests:

1. Run `make upd` in the repo's root folder.

-   Save your `DATABASE_URL=<connection_string>` environment variable for later.

2. Go to the `web/crux` directory: `cd web/crux`
3. Install dependencies `npm ci`
4. Build the package `npm run build`
5. Copy the _env.example_ file as _.env_ `cp .env.example .env`
6. On Linux:

-   Uncomment the `DNS_DEFAULT_RESULT_ORDER=ipv4first` line in the _.env_ file
-   Change the `CRUX_AGENT_ADDRESS` variable's value to `172.17.0.1:5000`

6. On Mac / Windows you may have to edit your OS's hosts file to be sure the `host.docker.internal` domain resolves to docker's bridge network.

-   Alternatively you can use your machine's LAN IP.

7. Deploy the database with `npm run prisma:migrate`
8. Start the backend in production mode with `npm run start:prod`
9. Repeat steps 3-5 in the `web/crux-ui` folder in a different terminal
10. Start the frontend in production mode with `npm run start:prod`
11. Be sure that `chromium` is installed on your system

-   You may have to run `npx playwright install-deps`
-   More info: https://playwright.dev/docs/intro
-   Additional note: On some systems like Manjaro, `npx playwright install-deps` does not work
    (warning message: "your OS is not officially supported by Playwright").
    In this case, you can run `npm init playwright@latest` and when prompted with the question "Install Playwright operating system dependencies", choose "No".
    After that, for Manjaro, you need to separately install Playwright from the AUR repository with the package manager and everything works just fine.

12. In a different terminal go to the `web/crux-ui` folder and run `npm run test:e2e`

-   If you want to run a specific test file from the `web/crux-ui/e2e` folder you can do it with `DEBUG=1 npx playwright test <file_name>`
-   If you want to open the inspector to see the tests running you can do it with `PWDEBUG=1 npx playwright test <file_name>`

## Changelog

We use various tools to draft our release, [changelogs](./CHANGELOG.md) are generated and versions are bumped. It's in the release target of the root folder's [Makefile](./Makefile).

```sh
make release
```

## Git branching strategy

We have two persistent branches: main, develop.
PRs are going into develop.
The develop branch is always fast-forward mergable to main.
PR titles must follow the conventional commit guidelines.

Release: a release commit is made to develop, package versions are bumped, develop is fast-forward merged into main.
Hotfix: in rare occassions, a hotfix/\*\* branch is created from main and the PR targets the main branch,
develop must be rebased to main -- using rebase-onto.

## Submit a Pull Request

Branch naming convention is as following

`TYPE/DESCRIPTION-DESCRIPTION`

When `TYPE` can be:

-   `chore/` - Formatting, style, repository structure, or version updates that do not affect functionality.
-   `cicd/` - Changes related to the CI/CD system, such as build script or configuration updates.
-   `doc/` - Changes focused on documentation updates, including README files, documentation files, or code comments.
-   `feat/` - Implementation of new features or functionality.
-   `fix/` - Resolution of bugs or issues in the codebase.
-   `hotfix/` - Urgent bug fixes on the main branch to address critical issues.
-   `refactor/` - Code changes to improve structure, readability, or maintainability.
-   `test/` - Changes related to testing, including adding or modifying test cases or improving the testing infrastructure.

All PRs must include a commit message with the changes described.

dyrector.io is following Conventional Commits, the commit messages should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

The commit contains the following structural elements, to communicate intent to the consumers of dyrector.io library:

1. **fix:** a commit of the _type_ `fix` patches a bug in your codebase (this correlates with [`PATCH`](http://semver.org/#summary) in Semantic Versioning).
1. **feat:** a commit of the _type_ `feat` introduces a new feature to the codebase (this correlates with [`MINOR`](http://semver.org/#summary) in Semantic Versioning).
1. **BREAKING CHANGE:** a commit that has a footer `BREAKING CHANGE:`, or appends a `!` after the type/scope, introduces a breaking API change (correlating with [`MAJOR`](http://semver.org/#summary) in Semantic Versioning).
   A BREAKING CHANGE can be part of commits of any _type_.
1. _types_ other than `fix:` and `feat:` are allowed, for example [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) (based on the [the Angular convention](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines)) recommends `build:`, `chore:`,
   `ci:`, `doc:`, `style:`, `refactor:`, `test:`, and others.
1. _footers_ other than `BREAKING CHANGE: <description>` may be provided and follow a convention similar to
   [git trailer format](https://git-scm.com/docs/git-interpret-trailers).

More info: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#specification).

## Security & Privacy

Security and privacy are extremely important to dyrector.io's core team, its independent developers, and users alike. Make sure to follow the best industry standards and practices.

## Dependencies

Please avoid introducing new dependencies to dyrector.io without consulting the team. New dependencies can be very helpful but also introduce new security and privacy issues, complexity, and impact total docker image size.

Adding a new dependency should provide meaningful value to the product with minimum possible risk.

## Other Ways to Help

Pull requests are great, but there are many other areas where you can help dyrector.io.

### Sending Feedbacks & Reporting Bugs

Sending feedback is a great way for us to understand your different use cases of dyrector.io better. If you had any issues, bugs, or want to share about your experience, feel free to do so on our GitHub issues page or at our [Discord server](https://discord.gg/hMyT9cbYFD).

### Submitting New Ideas

If you think dyrector.io could use a new feature, please open an issue on our GitHub repository, stating as much information as you can think of your new idea and it's implications. We'd also use this issue to gather more information, get more feedback from the community, and have a proper discussion about the new feature.

### Improving Documentation

Submitting documentation updates, enhancements, designs, or bug fixes. Spelling or grammar fixes will be very much appreciated.

### Commit signatures

Submitting pull requests require all commits to be signed with a GPG signature. Refer to the [GitHub documentation](https://docs.github.com/en/authentication/managing-commit-signature-verification) to setup GPG signing.
