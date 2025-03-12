# Getting Started

Our CLI tool lets you run and manage the entire, fully functional stack for development purposes.

Stack:

-   UI Service (crux-ui)
-   Backend Service (crux)
-   PostgreSQL database
-   Authentication (Ory Kratos)
-   Migrations
-   SMTP mail test server

## Requirements

-   Docker or Podman installed on your system.
-   Go Compiler to run the CLI from its source code. (Precompiled binaries are in the works.)

## Option 0: Using our convinience script
Using the following step, you can generate the appropriate docker compose files. Once generated, you can easily spin up your own dyrector.io platform instance.

```bash
# make sure to be in a folder where docker compose and config files should be generated
docker run --rm -it -v $PWD:/work --workdir /work ghcr.io/dyrector-io/dyrectorio/cli/dyo:stable generate compose
docker-compose up -d
```

## Option 1: Go install

1. Execute `go install github.com/dyrector-io/dyrectorio/golang/cmd/dyo@develop`
2. Execute `dyo up`
3. After you navigated to `localhost:8000` (this is the default Traefik port) you will see a Login screen
4. Register an account with whatever e-mail address you see fit (doesn't have to be valid one)
5. Navigate to `localhost:4436` where you will find your mail as all outgoing e-mails will land here
6. Open your e-mail message and using the link inside you can activate your account
7. Happy deploying! 🎬

## Option 2: From Source

1. Clone the repository to your local workdir with `git clone`
2. Execute `make up` in the project root
3. Open the `localhost:8000`
4. Happy deploying! 🎬

## Development resources

[Development](./DEVELOPMENT.md)
