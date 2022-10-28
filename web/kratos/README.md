# dyrector.io platform: kratos (dyo-auth)

We are working on the source code documentation, until then please use the root [README.md](../../README.md) for further information or check our official [documentation](https://docs.dyrector.io/) site.

- [Setup the environment](#setup-the-environment)
  - [Prerequirements](#prerequirements)
  - [Setup](#setup)
- [Set up the development environment](#set-up-the-development-environment)
- [Create an Identity](#create-an-identity)
- [Apple silicon dependencies](#apple-silicon-dependencies)
- [How it works](#how-it-works)
  - [Creating an Identity](#creating-an-identity)
  - [Services:](#services)
    - [1. kratos-postgres](#1-kratos-postgres)
    - [2. kratos](#2-kratos)
    - [3. kratos-migrate](#3-kratos-migrate)
    - [4. mailslurper](#4-mailslurper)
- [More info about kratos](#more-info-about-kratos)

## Setup the environment

### Prerequirements

- Docker
  - Installation guide https://docs.docker.com/engine/install/
- Docker Compose
  - Installation guide https://docs.docker.com/compose/install/
- jq - Command-line JSON Processor
  - https://stedolan.github.io/jq/
- Create an Invisible Recaptcha v2 in the recaptcha console
  - Open https://www.google.com/recaptcha/admin/create
  - Add Docker's predefined IP (`eg.:172.17.0.1`) to the domains section

### Setup

To login you have to add a new user in the Kratos service. You can find a
tutorial for this below in this documentation. Add a new user:
[link](#add-a-new-user)

- Create or Copy the existing example `.env` file in the project's root folder

  - `COMPOSE_FILE` define the compose files in `.env`
  - `local.yaml` only needed in local development
  - `kratos.yaml` and `auth.yaml` needed in production

- Build in the project's root folder:

  `docker-compose build`

- Run:

  `docker-compose up`

## Set up the development environment

- Set your node version with `nvm` (node version manager) to stable

```bash
nvm use stable
```

- Install packages and opt-out from nextjs telemetry

```bash
cd dyo-auth
npm install
npm run disable-telemetry
```

### In local development

- To add an identity add the following environment variable to the dyo-kratos
  service:

```
SERVE_ADMIN_BASE_URL=http://172.17.0.1:4434
```

and of course add to `kratos.yml` the next line:

```
SERVE_ADMIN_BASE_URL=$SERVE_ADMIN_BASE_URL
```

- Run kratos container with compose:

```
docker-compose up -f kratos.yaml -f local.yaml
```

- Run the NextJS app in the dyo-auth folder (same container = `auth.yaml`)

```bash
npm run dev
```

## Create an Identity

To add new user in the Kratos serice you have to expose the admin port, for this
comment out the port forwarding "`4434:4434`" line in `kratos.yaml`

## MacOS dependencies

You have to add `127.0.0.1 host.docker.internal` line in the `/etc/hosts` file,
and you have to change the `172.17.0.1` IP addresses in `.env` file to
`host.docker.internal`.

## How it works

### Creating an Identity

You need to expose the admin port for this one to work. The following document
walks you through the administrative identity management in Ory Kratos. You
should already be familiar with the Identity Schema before reading this guide:

https://www.ory.sh/kratos/docs/admin/managing-users-identities

### Network

Create the external network:

```
docker network create --driver bridge crux-intranet
```

### Services

### 1. kratos-postgres

This is the database where kratos stores the users and their flows.

### 2. kratos

This is kratos itself. It needs these files:

- kratos.yaml which is the config of the service
- identity.schema.json which describe the kind of properties our users have

These configuration files must be shared between kratos and kratos-migrate.

### 3. kratos-migrate

The container handles the db updates between version changes. For instance when
we will update kratos this container will run the migration scripts. **This
should always run before the normal kratos container starts!**

### 4. mailslurper

For development purposes this mimics an smtp server. It intercepts all the mail
sent by kratos. You can access it from your browser at http://0.0.0.0:4436

## Maintainers

- Mate Vago
- !!! We have to add atleast one more maintainer !!!

---

## More info about kratos

https://www.ory.sh/kratos/docs/concepts/index
