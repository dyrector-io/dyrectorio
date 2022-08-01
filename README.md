![dyrectorio logo](dyrectorio.svg)

# dyrector.io - The open source internal delivery platform

[![License](https://img.shields.io/badge/licence-Apache%202.0-brightgreen.svg?style=flat)](LICENSE)
[![Discord Budget](https://img.shields.io/discord/797082431902449694)](https://discord.gg/pZWbd4fxga)
[![codecov](https://img.shields.io/codecov/c/github/dyrector-io/dyrectorio/develop?logo=Go&token=F5TZTAJTKX)](https://codecov.io/gh/dyrector-io/dyrectorio)

## Overview

dyrector.io is an **open-source** internal delivery platform that helps developers to deliver applications to more places efficiently by simplifying software releases and operations in any environment.

> ⚠️ Disclaimer: dyrector.io platform is under development, please treat as such. Expect bugs here and there. Early adopters welcome.

## Key features

- Kubernetes and Docker support
- Multi-instance deployment
- Instant test environments from any branches
- Environment management
- Secret and configuration management
- Auto-generated changelogs and release notes
- Workflow support
- Scheduled releases
- Audit log
- Container Registry integrations
- Fine-grained RBAC
- ChatOps & notification solutions

## Quick Start

### Prerequirements

- Install Docker and Docker Compose to your machine

### Development (Local)
The easiest way to get started with the dyrector.io platform is by our premade [docker-compose](./web/docker-compose.dev.yaml) file.

1. First you have to create `.env` from `.env.example` files in your local environment, in the following folders: `/web`, `/web/crux`, `/web/crux-ui`

On *Windows* and *Mac* use `host.docker.internal` in the `.env` files for URLs.

2. Build the dyrector.io platform dependencies, this step is only required once: 
```
docker-compose -f web/docker-compose.dev.yaml build
```

3. To run the dyrector.io platform dependencies:
```
docker-compose -f web/docker-compose.dev.yaml up
```

If you are having problems starting `crux-kratos-migrate` change the line endings of `web/kratos/entrypoint.sh` from CRLF to LF. These problems include `ERROR: Encountered errors while bringing up the project.` while running `docker-compose up` or `': No such file or directory` in the container log.

4. Now as all the infrastructure is ready, you need to install all the node.js dependencies in the specific projects' folder. To install all (  `web/crux/`, `web/crux-ui/` ) dependencies run `npm install`.

_on Apple Silicon run `npm install --target_arch=x64`_

5. In `crux/` folder you have to migrate the database and generate the Prisma client
```
npx prisma generate
npx prisma migrate deploy
```

6. Create a reCaptcha v3 key pair and set `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY` in `/web/crux-ui/.env`. Make sure to use `localhost` or `host.internal` as the domain.

7. To start services run `npm start` in the followind folders `/web/crux` and `/web/crux-ui`

8. Open the platform in `host.docker.internal:8000` and register

9. In local our auth service is using a mock, so you can confirm your email in `http://localhost:4436/`

10. Now you can log in and use the platform

### Hosted version (SaaS)

We are planning to support a hosted version in the near future.

## FAQ

- How do I get in touch with the Support Team?

    You can contact dyrector.io support directly using our [contact forms](https://dyrector.io/contact) for users and developers or by reaching out to us via email at help@dyrector.io. Developers can get in touch via our Community Discord server.

- Can we use dyrector.io without containerization?

    Unfortunately, we're unable to support applications that don't run in a containerization environment.


## Community

Also, follow dyrector.io on GitHub Discussions, our [Blog](https://blog.dyrector.io), and on [Twitter](https://twitter.com/dyrectorio). You can chat with the team and other members on [Discord](https://discord.gg/pZWbd4fxga).

dyrector.io is Open Source - This repository, and most of our other open source projects, are licensed under the Apache 2.0.

Join our Discord and connect with other members to share and learn together.
Send a pull request to any of our open source repositories on Github. Check our contribution guide and our developers guide for more details about how to contribute. We're looking forward to your contribution!

[![dyrectorio Discord server Banner](https://discordapp.com/api/guilds/797082431902449694/widget.png?style=banner2)](https://discord.gg/pZWbd4fxga)

## Contributing
The project can only accept contributions which are licensed under the [Apache License 2.0](LICENSE). For further information please see our [Contribution Guidelines](CONTRIBUTING.md).

## Changelog

Install the generator
```
go get -u github.com/git-chglog/git-chglog/cmd/git-chglog
```

Usage
```
git-chglog -o CHANGELOG.md
```

```
git tag -a v1.x.x
git push --tags
```

In order to draft a new release: 
- create a new release tag on develop
- generate changelogs

See [CHANGELOG.md](CHANGELOG.md) 

## Feedback

We’d love to hear your thoughts on this project. Feel free to drop us a note!

## License
dyrector.io is open source software under the [Apache License 2.0](LICENSE). Complete license and copyright information can be found in the source code.


> Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.