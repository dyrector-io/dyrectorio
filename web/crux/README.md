# CRUX Backend Service

## Table of Content

  * [Requirements](#requirements)
  * [Development](#development)
  * [Project structure](#project-structure)
  * [Technology stack](#technology-stack)
    + [Nest](#nest)
    + [Prisma](#prisma)
    + [Notes to the team](#notes-to-the-team)
    + [gRPC TLS](#grpc-tls)
  * [Maintainers](#maintainers)
  * [Disclaimer](#disclaimer)


## Requirements

- Node.js https://nodejs.org/en/ and npm (node package manager)
- Protocol Buffer Compiler [Installation Guide](https://grpc.io/docs/protoc-installation/)
- Docker for virtualization - [Get Docker](https://docs.docker.com/get-docker/)

## Development

- Install dependencies: `npm install`
- To run a local database, just run the following command: `npm run database:up` which will be fire up a postgres db in docker container
- Migrate the models to database: `npx prisma migrate deploy`
- Seed the database with mock data: `npx prisma db seed`
- Start your local server: `npm start`

To stop the datbase container you have to use the following command:
`npm run database:down`

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

We are using NestJs Framework for the CRUX backend. NestJS is a progressive Node.js framework for building efficient,
reliable and scalable server-side applications.

### Prisma

Prisma Client is an auto-generated and type-safe query builder that's tailored to your data. [Prisma Official documentation](https://www.prisma.io/)

Useful Prisma command for development:

- `npx prisma db seed` - seed the database with data
- `npx prisma migrate dev --name ${name}` - create migration file and apply for the database
- `npx prisma migrate deploy` - apply the migration files to database

### Notes to the team

How can I get Bearer token from registry?

https://auth.docker.io/token?service=registry.docker.io

- Harbor Registry API: `https://reg.dyrector.io/service/token?service=harbor-registry` with Basic authentication
  username and token generates by Harbor UI Platform.

- Docker HUB Registry API `https://auth.docker.io/token?service=registry.docker.io` with username password in JSON
  format:

```
{
	"username": "robot$leevi-test",
	"password": "TOKEN_FROM_HARBOR"
}
```
### gRPC TLS

We use server-side TLS, shipping the servers public key with the agents.

gRPC clients do SAN check verification, SAN is part of the generated keys and can have multiple values if needed.

For the ease of development, the checked in certifates are generated for localhost. You can check with the following command:

```openssl x509 -noout -text -in certs/public.crt | grep DNS:```

In order to create others check [cert_gen script](cert_gen.sh).
NestJS assumes this file is present, no insecure communication is allowed.

Example usage:
```
./cert_gen.sh app.dyrector.io
```
This means agents can connect using that address.

> Disclaimer
>
> Not working under MacOS Monetery 12.2 (Chip: M1 Pro) with LibreSSL 2.8.3 & Homebrew - OpenSSL 1.1

## Maintainers
- Mate Vago
- Nandor Magyar
- Levente Orban

## Disclaimer

If anything missing from the document, please request the Maintainers to add it.