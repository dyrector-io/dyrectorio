# dyrector.io platform: crux

We are working on the source code documentation, until then please use the root [README.md](../../README.md) for further
information or check our official [documentation](https://docs.dyrector.io/) site.

## Project structure

- `assets/` - TBD
- `prisma/`
  - `/migrations` - Your migration history is the story of the changes to your data model, and is represented by a this
    folder with a sub-folder and migration.sql file for each migration.
- `/proto` - gRPC proto files for communicate against the `agent`
- `/src`

  - `/app` - NestJS core application, each model has it's own folder with service, controller and repository serivces.
  - `builders/` -
  - `decorators/` -
  - `domain/` - Internal logic of the application
  - `exception/` - Errors and Exceptions
  - `filters/` - Custom filters
  - `grpc/` -
  - `guards/` - Custom guards
  - `interceptors/` -
  - `mailer/` -
  - `services/` -
  - `shared/` - NestJS shared resources
  - `websockets/` -

## Technology stack

### Nest

We are using Nest.js Framework for the CRUX backend, is a progressive Node.js framework for building efficient, reliable
and scalable server-side applications.

### Prisma

Prisma Client is an auto-generated and type-safe query builder that's tailored to your data.
[Prisma Official documentation](https://www.prisma.io/)
