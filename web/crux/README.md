# dyrector.io platform: crux

We are working on the source code documentation, until then please use the root [README.md](../../README.md) for further information or check our official [documentation](https://docs.dyrector.io/) site.

## Project structure

 - `certs/` - Generated certificates, created for testing and local development purpose
 - `prisma/`
    - `/migrations` - Your migration history is the story of the changes to your data model, and is represented by a this folder with a sub-folder and migration.sql file for each migration.
    - `/seed` - This folder contains all data to seed your database using Prisma Client and Prisma's integrated seeding functionality. Seeding allows you to consistently re-create the same data in your database.
 - `/proto` - gRPC proto files for communicate against the `dagent` and `crux-ui`
 - `/scripts` - every development related script
 - `/containerization ` -
 - `/src` -
    - `/app` - NestJS core application, each model has it's own folder with service, controller and repository serivces.
    - `/config` - Config related files
    - `/domain` - Internal logic of the application
    - `/exception` - Errors and Exceptions
    - `/proto` - Generated proto typescript from .proto files
    - `/shared` - NestJS shared resources

## Technology stack

### Nest

We are using Nest.js Framework for the CRUX backend, is a progressive Node.js framework for building efficient, reliable and scalable server-side applications.

### Prisma

Prisma Client is an auto-generated and type-safe query builder that's tailored to your data. [Prisma Official documentation](https://www.prisma.io/)
