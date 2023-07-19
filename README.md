<p align="center">
  <a href="http://docs.dyrector.io/" target="blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="docs/dyrectorio-dark.png">
      <source media="(prefers-color-scheme: light)" srcset="docs/dyrectorio-light.png">
      <img alt="dyrector.io official logo" src="docs/dyrectorio-dark.png" width="400">
    </picture>
  </a>
</p>

<div align="center">dyrector.io is a self-hosted container management platform.

<p align="center">
  <a href="https://github.com/dyrector-io/dyrectorio/tags" target="_blank"><img src="https://img.shields.io/github/v/tag/dyrector-io/dyrectorio" alt="GitHub tag (latest by date)"/></a>
    <a href="./LICENSE" target="_blank"><img src="https://img.shields.io/badge/licence-Apache%202.0-brightgreen.svg?style=flat)" alt="License"/></a>
    <a href="https://discord.gg/pZWbd4fxga" target="_blank"><img src="https://img.shields.io/discord/797082431902449694" alt="Discord Budget"/></a>
    <a href="https://codecov.io/gh/dyrector-io/dyrectorio" target="_blank"><img src="https://img.shields.io/codecov/c/github/dyrector-io/dyrectorio/develop?logo=Go&token=F5TZTAJTKX" alt="codecov"/></a>
    <a href="https://github.com/dyrector-io/dyrectorio/graphs/contributors" target="_blank"><img src="https://img.shields.io/github/contributors/dyrector-io/dyrectorio" alt="GitHub contributors"/></a>
    <a href="https://github.com/dyrector-io/dyrectorio/issues" target="_blank"><img src="https://img.shields.io/github/issues-raw/dyrector-io/dyrectorio" alt="GitHub issues"/></a>
    <a href="https://twitter.com/dyrectorio" target="_blank"><img src="https://img.shields.io/twitter/follow/dyrectorio?style=social" alt="Twitter Follow"/></a>
</p>
</div>

## Overview

dyrector.io helps engineer & DevOps teams and individual developers to shift their focus from maintaining and setting up their containerized applications to developing their software. The platform achieves this by offering continuous delivery and version management capabilities to your OCI containers.

> **Warning**
> The platform is under development, please treat as such. Expect bugs here and there. Early adopters welcome.

Join our Discord and connect with other members to share and learn together. If you like the project, give us a Star.

## 🌊 Use cases

#### 🚢 Container utilization without commands

Interact with containers in Docker, Podman & Kubernetes without any experience to these technologies. Deploy, start, stop, and restart containers running locally or in remote infrastructures via the platform.

#### ⛴️ Configuration Abstractions & JSON editing

Configuration screen lets you to filter out the unnecessary common, Docker or Kubernetes variables to avoid misconfiguration. JSON editing is still available.

#### ⛵️ Multi-Instance Deployments

Trigger deployments of the same stack to multiple environments from one interface using the same or various configurations.

#### 🛳️ Instant sandbox environments

Turn your local setup into a test & demo environment by deploying your container to it via the platform.

## Demo

https://user-images.githubusercontent.com/9247788/219671903-41da385e-4f8f-4fba-a7e4-c6ec4f727b7f.mp4

## Key features

-   Kubernetes, Docker and Podman support
-   Multi-instance deployment
-   Instant test environments from any branches
-   Environment management
-   Secret and configuration management
-   Auto-generated changelogs and release notes
-   Workflow support
-   Scheduled releases
-   Audit log
-   Container Registry integrations
-   Fine-grained RBAC
-   ChatOps & notification solutions

## Getting Started

Our CLI tool lets you run and manage the entire, fully functional stack for development purposes.

Stack:
-   UI Service (crux-ui)
-   Backend Service (crux)
-   PostgreSQL database
-   Authentication (Ory Kratos)
-   Migrations
-   SMTP mail test server

### Requirements

-   Docker or Podman installed on your system.
-   Go Compiler to run the CLI from its source code. (Precompiled binaries are in the works.)

### Option 1: Go install

1. Execute `go install github.com/dyrector-io/dyrectorio/golang/cmd/dyo@develop`
2. Execute `dyo up`
3. After you navigated to `localhost:8000` (this is the default Traefik port) you will see a Login screen
4. Register an account with whatever e-mail address you see fit (doesn't have to be valid one)
5. Navigate to `localhost:4436` where you will find your mail as all outgoing e-mails will land here
6. Open your e-mail message and using the link inside you can activate your account
7. Happy deploying! 🎬

### Option 2: From Source

1. Clone the repository to your local workdir with `git clone`
2. Execute `make up` in the project root
3. Open the `localhost:8000`
4. Happy deploying! 🎬

## Development

## Development

1. Run `make upd` in the repo's root folder.
  - Save your `DATABASE_URL=<connection_string>` environment variable for later.
2. Go to the `web/crux` directory: `cd web/crux`
3. Install dependencies `npm ci`
4. Copy the _env.example_ file as _.env_ `cp .env.example .env`
  - Paste `DATABASE_URL=<connection_string>` variable from step 1 to _.env_
5. On Linux:
  - Uncomment the `DNS_DEFAULT_RESULT_ORDER=ipv4first` line in the _.env_ file
  - Change the `CRUX_AGENT_ADDRESS` variable's value to `172.17.0.1:5000`
6. On Mac / Windows you may have to edit your OS's hosts file to be sure the `host.docker.internal` domain resolves to docker's bridge network.
  - Alternatively you can use your machine's LAN IP.
7. Deploy the database with `npm run prisma:migrate`
8. Start the backend with `npm run start`
9. Go to the `web/crux-ui` directory: `cd web/crux-ui`
10. Install dependencies `npm ci`
11. Copy the _env.example_ file as _.env_ `cp .env.example .env`
12. Start the frontend with `npm run start`
13. After you navigated to `localhost:8000` (this is the default Traefik port) you will see a Login screen
14. Register an account with whatever e-mail address you see fit (doesn't have to be valid one)
15. Navigate to `localhost:4436` where you will find your mail as all outgoing e-mails will land here
16. Open your e-mail message and using the link inside you can activate your account
17. Fruitful contributing! 🎬

Read more about the CLI in the [documentation](https://docs.dyrector.io/get-started/cli).

## Testing
Unit tests:
- In the `web/crux` or `web/crux-ui` folder respectively:
1. Run `npm ci`.
2. Start the tests with `npm run test`.

End-to-end tests:
1. Run `make upd` in the repo's root folder.
  - Save your `DATABASE_URL=<connection_string>` environment variable for later.
2. Go to the `web/crux` directory: `cd web/crux`
3. Install dependencies `npm ci`
4. Build the package `npm run build`
5. Copy the _env.example_ file as _.env_ `cp .env.example .env`
6. On Linux:
  - Uncomment the `DNS_DEFAULT_RESULT_ORDER=ipv4first` line in the _.env_ file
  - Change the `CRUX_AGENT_ADDRESS` variable's value to `172.17.0.1:5000`
6. On Mac / Windows you may have to edit your OS's hosts file to be sure the `host.docker.internal` domain resolves to docker's bridge network.
  - Alternatively you can use your machine's LAN IP.
7. Deploy the database with `npm run prisma:migrate`
8. Start the backend in production mode with `npm run start:prod`
9. Repeat steps 3-5 in the `web/crux-ui` folder in a different terminal
10. Start the frontend in production mode with `npm run start:prod`
11. Be sure that `chromium` is installed on your system
  - You may have to run `npx playwright install-deps`
  - More info: https://playwright.dev/docs/intro
  - Additional note: On some systems like Manjaro, `npx playwright install-deps` does not work 
    (warning message: "your OS is not officially supported by Playwright").
    In this case, you can run `npm init playwright@latest` and when prompted with the question "Install Playwright operating system dependencies", choose "No".
    After that, for Manjaro, you need to separately install Playwright from the AUR repository with the package manager and everything works just fine.
12. In a different terminal go to the `web/crux-ui` folder and run `npm run test:e2e`
  - If you want to run a specific test file from the `web/crux-ui/e2e` folder you can do it with `DEBUG=1 npx playwright test <file_name>`
  - If you want to open the inspector to see the tests running you can do it with `PWDEBUG=1 npx playwright test <file_name>`

## Non-development

You can set up dyrector.io for self-hosting purposes with the [docker-compose](https://github.com/dyrector-io/dyrectorio/blob/develop/docker-compose.yaml) file located in the root folder.

## Hosted version (SaaS)

Besides the self-hosted instance, you can check out the platform's alpha at [app.dyrectorio.com](https://app.dyrectorio.com). The platform is still in the works, we might reset the database, so it's not recommended for production yet. In case you are interested about using dyrector.io in production, reach out to us via [email](hello@dyrector.io) and we'll set up a stable instance for you.

## How it works

dyrector.io consists of an agent (GoLang) and a platform (UI developed in React.js, Next.js. Backend developed in Node.js, Nest.js). There are two types of agents communicating with the platform: one for Docker and another for Kubernetes. Communication takes place in gRPC with TLS encryption. The data is managed in a PostgreSQL database which we use with Prisma ORM.

<p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="docs/how-it-works-dark.png">
      <source media="(prefers-color-scheme: light)" srcset="docs/how-it-works-light.png">
      <img alt="dyrector.io official logo" src="docs/how-it-works-dark.png" width="600">
    </picture>
</p>

## FAQ

-   Can we use dyrector.io without containerization?

    Unfortunately, we're unable to support applications that don't run in a containerization environment.

-   Will the tool remain completely free in the future, despite certain features only being accessible with a license key in upcoming versions, despite being open source?

    Our team consists of seven people, and although not all of them work on this project full-time, the majority do. We need to pay our engineers every month, and currently, we generate revenue by providing consultancy services. We are a fully independent team and do not have any investments. Our long-term goal is to work on this project full-time but to achieve this, we require funding.

    Our plan is to make the full project available for free if you choose to self-host it, but we also want to create a SaaS model where users can pay based on their usage. We don't have a complete plan for this yet. At present, we enjoy working on this project, collecting feedback, and making improvements to it.

-   What was the motivation behind making this tool?

    We were working on a totally different project that included self-service release management capabilities of containerized apps as a business requirement. Our client made a white labelled product that needed self-service deployments to redistribute the product. While Portainer and Yacht are amazing projects, we just couldn't find one serving our exact needs, so we decided to make our platform.

    After a while, we noticed that this is a bit of a niche use case, so we tried to extend its capabilities into an Internal Developer Platform direction so that it can be valuable to a lot of users. On top of these, we decided to make it open source so users can take a better look at the project before introducing it into their infrastructure.

-   How do I get in touch with the Support Team?

    You can contact us directly by reaching out to us via email at help@dyrector.io. Developers can get in touch via our Community Discord server.

## Community

Also, follow us on GitHub Discussions, our [Blog](https://blog.dyrector.io), and on [Twitter](https://twitter.com/dyrectorio). You can chat with the team and other members on [Discord](https://discord.gg/pZWbd4fxga).

dyrector.io is Open Source - This repository, and most of our other open source projects, are licensed under the Apache 2.0.

Join our Discord and connect with other members to share and learn together.
Send a pull request to any of our open source repositories on Github. Check our contribution guide and our developers guide for more details about how to contribute. We're looking forward to your contribution!

[![dyrectorio Discord server Banner](https://discordapp.com/api/guilds/797082431902449694/widget.png?style=banner2)](https://discord.gg/pZWbd4fxga)

## Contributing

The project can only accept contributions which are licensed under the [Apache License 2.0](LICENSE). For further information please see our [Contribution Guidelines](CONTRIBUTING.md).

## Releases

We use [semantic versioning](https://semver.org/), but shifted to the right, we don't bump major versions yet, until we reach beta phase.

Minor version is raised if:

-   introduction of a braking API change (proto or HTTP)
-   new feature set is completed
-   milestone is reached
-   agent configuration changes

Patch version is raised if:

-   important fixes in develop
-   any other reason

## Changelog

Install the generator

```
go get -u github.com/git-chglog/git-chglog/cmd/git-chglog
```

Usage

```
git-chglog --next-tag vx.y.z -o CHANGELOG.md
```

```
git tag -a vx.y.z
git push --tags
```

In order to draft a new release:

-   create a new release tag on develop
-   generate changelogs

See [CHANGELOG.md](CHANGELOG.md)

## Feedback

We’d love to hear your thoughts on this project. Feel free to drop us a note!

## License

dyrector.io is open source software under the [Apache License 2.0](LICENSE). Complete license and copyright information can be found in the source code.

> Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
