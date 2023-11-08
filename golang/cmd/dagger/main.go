package main

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"strings"

	"dagger.io/dagger"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout})
	log.Info().Msg("Dagger test")

	ctx := context.Background()
	client := initDaggerClient(ctx)
	defer client.Close()

	// runGoPipeline(ctx, client)

	// runCruxUnitTestPipeline(ctx, client)

	// runCruxUIUnitTestPipeline(ctx, client)

	/**/
	// Crux prod run test with its PostgresSQL DB service container
	cruxEnv := getEnv("web/crux/.env")
	cruxPostgres := getCruxPostgres(client, cruxEnv)
	runCruxProd(ctx, client, cruxPostgres)
	/**/

	// runE2eTestPipeline(ctx, client)
}

func initDaggerClient(ctx context.Context) *dagger.Client {
	client, err := dagger.Connect(ctx, dagger.WithLogOutput(os.Stdout))
	if err != nil {
		panic(err)
	}
	return client
}

func runGoPipeline(ctx context.Context, client *dagger.Client) {
	log.Info().Msg("Run go pipeline...")

	golang := client.Container().From("golang:1.20").
		WithExec([]string{"go", "version"})

	version, err := golang.Stdout(ctx)
	if err != nil {
		panic(err)
	}

	log.Info().Msg(version)
	log.Info().Msg("Go pipeline done.")
}

func runCruxUnitTestPipeline(ctx context.Context, client *dagger.Client) {
	log.Info().Msg("Run crux unit test pipeline...")

	_, err := client.Container().From("node:20-alpine").
		WithDirectory("/src", client.Host().Directory("web/crux/"), dagger.ContainerWithDirectoryOpts{
			Exclude: []string{"node_modules"},
		}).
		WithWorkdir("/src").
		WithExec([]string{"npm", "ci"}).
		WithExec([]string{"npm", "run", "test"}).
		Stdout(ctx)
	if err != nil {
		panic(err)
	}

	log.Info().Msg("Crux unit test pipeline done.")
}

func runCruxUIUnitTestPipeline(ctx context.Context, client *dagger.Client) {
	log.Info().Msg("Run crux-ui unit test pipeline...")

	_, err := client.Container().From("node:20-alpine").
		WithDirectory("/src", client.Host().Directory("web/crux-ui/"), dagger.ContainerWithDirectoryOpts{
			Exclude: []string{"node_modules", ".next"},
		}).
		WithWorkdir("/src").
		WithExec([]string{"npm", "ci"}).
		WithExec([]string{"npm", "run", "test"}).
		Stdout(ctx)
	if err != nil {
		panic(err)
	}

	log.Info().Msg("Crux-ui unit test pipeline done.")
}

func getEnv(envPath string) map[string]string {
	cruxEnv, err := godotenv.Read(envPath)
	if err != nil {
		panic(err)
	}
	return cruxEnv
}

func getCruxPostgres(client *dagger.Client, cruxEnv map[string]string) *dagger.Container {
	databaseURL := cruxEnv["DATABASE_URL"]
	parsedURL, err := url.Parse(databaseURL)
	if err != nil {
		panic(err)
	}
	postgresUsername := parsedURL.User.Username()
	postgresPassword, _ := parsedURL.User.Password()
	postgresDB := strings.TrimPrefix(parsedURL.Path, "/")

	dataCache := client.CacheVolume("data")

	cruxPostgres := client.Pipeline("crux-postgres").Container().From("postgres:14.2-alpine").
		WithMountedCache("/data", dataCache).
		WithEnvVariable("POSTGRES_USER", postgresUsername).
		WithEnvVariable("POSTGRES_PASSWORD", postgresPassword).
		WithEnvVariable("POSTGRES_DB", postgresDB).
		WithEnvVariable("PGDATA", "/data/postgres").
		WithExposedPort(5432)
		// .WithExec(nil)
		// .WithFocus()

	return cruxPostgres
}

func runCruxProd(ctx context.Context, client *dagger.Client, cruxPostgres *dagger.Container) *dagger.Container {
	crux := client.Pipeline("crux").Container().From("node:20-alpine")
	crux = crux.
		WithDirectory("/src", client.Host().Directory("web/crux/"), dagger.ContainerWithDirectoryOpts{
			Exclude: []string{"node_modules"},
		}).
		WithWorkdir("/src").
		WithServiceBinding("localhost", cruxPostgres).
		// WithEnvVariable("NOCACHE", time.Now().String()).
		WithExec([]string{"npm", "ci"}).
		WithExec([]string{"npm", "run", "build"}).
		WithExec([]string{"npm", "run", "prisma:migrate"}).
		WithExec([]string{"npm", "run", "start:prod"}) //.
		// WithExec([]string{"ls", "/src"}).
		// WithExec([]string{"du", "-sh", "/src"}).
		// WithExec([]string{"npm", "run", "start:prod", "&"}).
		// WithExposedPort(6666) // just to keep alive as service

	// log.Info().Msg("test crux before")
	_, err := crux.Stdout(ctx)
	if err != nil {
		panic(err)
	}
	// log.Info().Msg("test crux after")

	return crux
}

func runCruxUIProd(ctx context.Context, client *dagger.Client, crux *dagger.Container) *dagger.Container {
	cruxUI := client.Pipeline("crux-ui").Container().From("node:20-alpine") // .WithServiceBinding("crux", crux)

	cruxUI = cruxUI.
		WithDirectory("/src", client.Host().Directory("web/crux-ui/"), dagger.ContainerWithDirectoryOpts{
			Exclude: []string{"node_modules", ".next"},
		}).
		WithWorkdir("/src").
		WithServiceBinding("crux", crux).
		// WithEnvVariable("NOCACHE", time.Now().String()).
		WithExec([]string{"npm", "ci"}).
		WithExec([]string{"npm", "run", "build"}).
		// WithExec([]string{"npm", "run", "start:prod"}).
		WithExec([]string{"npm", "run", "start:prod", "&"}).
		WithExposedPort(6666)

	log.Info().Msg("test crux-ui log")
	_, err := cruxUI.Stdout(ctx)
	if err != nil {
		panic(err)
	}
	log.Info().Msg("test crux-ui log 2")

	return cruxUI
}

func runPlaywright(ctx context.Context, client *dagger.Client, cruxUI *dagger.Container) *dagger.Container {
	e2e := client.Pipeline("e2e").Container().From("node:20-alpine")

	e2e = e2e.
		WithDirectory("/src", client.Host().Directory("web/crux-ui/"), dagger.ContainerWithDirectoryOpts{
			Exclude: []string{"node_modules", ".next"},
		}).
		WithWorkdir("/src").
		WithServiceBinding("localhost", cruxUI).
		// WithEnvVariable("NOCACHE", time.Now().String()).
		WithExec([]string{"npm", "ci"}).
		WithExec([]string{"npm", "run", "build"}).
		WithExec([]string{"npx", "playwright", "test", "--workers", "4"})

	_, err := e2e.Stdout(ctx)
	if err != nil {
		panic(err)
	}

	return e2e
}

// func runE2eTestPipeline(ctx context.Context, client *dagger.Client) {
// 	log.Info().Msg("Run E2E test pipeline...")

// 	cruxEnv := getEnv("web/crux/.env")
// 	cruxPostgres := getCruxPostgres(client, cruxEnv)
// 	crux := runCruxProd(ctx, client, cruxPostgres)
// 	cruxUI := runCruxUIProd(ctx, client, crux)

// 	// playwright := runPlaywright(ctx, client, cruxUI)

// 	cruxHostname, _ := crux.Hostname(ctx)
// 	log.Info().Msg("crux hostname: " + cruxHostname)
// 	cruxUIHostname, _ := cruxUI.Hostname(ctx)
// 	log.Info().Msg("crux-ui hostname: " + cruxUIHostname)
// 	// playwrightHostname, _ := playwright.Hostname(ctx)
// 	// log.Info().Msg("playwright hostname: " + playwrightHostname)

// 	log.Info().Msg("E2E test pipeline done.")
// }

func runE2eTestPipeline(ctx context.Context, client *dagger.Client) {
	log.Info().Msg("Run E2E test pipeline...")

	env := getEnv(".env.http-only.dagger")
	log.Info().Msg("env test - COMPOSE_FILE: " + env["COMPOSE_FILE"]) // remove

	mailslurper /*, err*/ := client.Container().From("oryd/mailslurper:smtps-latest").
		// WithExposedPort(1025). // port 1025 is used internally for smtp, you do not have to expose that
		WithExposedPort(4436).
		WithExposedPort(4437) // .Sync(ctx)
	// mailslurper.Sync(ctx) // remove

	traefik /*, err*/ := client.Container().From("traefik:2.9").
		WithUnixSocket(env["DOCKER_SOCKET"], client.Host().UnixSocket("/var/run/docker.sock:ro")).
		WithExec(nil).
		WithExec([]string{"--log.level=DEBUG"}).
		// WithExec([]string{"--api.insecure=true"}).
		WithExec([]string{"--providers.docker=true"}).
		WithExec([]string{"--providers.docker.exposedbydefault=false"}).
		WithExec([]string{"--entrypoints.web.address=:80"}).
		WithExposedPort(80).
		WithExposedPort(8080)
	// 	Sync(ctx)
	// if err != nil {
	// 	panic(err)
	// }

	traefik.WithExec(nil) // remove

	/**/
	// _, err := traefik.Stdout(ctx)
	// if err != nil {
	// 	panic(err)
	// }
	/**/

	cruxPostgresDataCache := client.CacheVolume("cruxPostgres")
	cruxPostgres /*, err*/ := client.Pipeline("crux-postgres").Container().From("postgres:15.4-alpine3.18").
		WithMountedCache("/data", cruxPostgresDataCache).
		WithEnvVariable("POSTGRES_USER", "crux").
		WithEnvVariable("POSTGRES_PASSWORD", env["CRUX_POSTGRES_PASSWORD"]).
		WithEnvVariable("POSTGRES_DB", "crux").
		WithEnvVariable("PGDATA", "/data/postgres").
		WithExposedPort(5432)
	// 	Sync(ctx)
	// cruxPostgres.Sync(ctx) // remove

	cruxImage := fmt.Sprintf("ghcr.io/dyrector-io/dyrectorio/web/crux:%s", env["DYO_VERSION"])
	cruxMigrateDatabaseUrl := fmt.Sprintf(
		"postgresql://crux:%s@crux-postgres:5432/crux?schema=public&connect_timeout=5",
		env["CRUX_POSTGRES_PASSWORD"])
	cruxMigrate := client.Pipeline("crux").Container().From(cruxImage).
		WithEnvVariable("TZ", env["TIMEZONE"]).
		WithEnvVariable("DATABASE_URL", cruxMigrateDatabaseUrl).
		WithServiceBinding("crux-postgres", cruxPostgres).
		WithServiceBinding("mailslurper", mailslurper). // remove
		WithServiceBinding("traefik", traefik).
		WithExec([]string{"migrate"})

	_, err := cruxMigrate.Stdout(ctx)
	if err != nil {
		panic(err)
	}

	// This is insecure, do not use this in production or on the public internet
	// example URI: smtps://test:test@mailslurper:1025/?skip_ssl_verify=true&legacy_ssl=true
	// mailslurper, err := client.Container().From("oryd/mailslurper:smtps-latest").
	// 	// WithExposedPort(1025). // port 1025 is used internally for smtp, you do not have to expose that
	// 	WithExposedPort(4436).
	// 	WithExposedPort(4437).Sync(ctx)
	// mailslurper.Sync(ctx) // remove

	// _, err := traefik.Stdout(ctx)
	// if err != nil {
	// 	panic(err)
	// }

	playwright := client.Container().From("ghcr.io/dyrector-io/dyrectorio/playwright:latest").
		// playwright := client.Container().From("mcr.microsoft.com/playwright:v1.37.0-jammy").
		// WithUnixSocket(env["DOCKER_SOCKET"], client.Host().UnixSocket("/var/run/docker.sock:ro")). // probably not needed, but not sure
		// WithServiceBinding("traefik", traefik).
		WithServiceBinding("mailslurper", mailslurper).
		WithExec([]string{"npm", "ci", "--include=dev", "--arch=x64", "--cache", ".npm", "--prefer-offline", "--no-fund"}).
		WithExec([]string{"npx", "playwright", "install", "chromium"})
		// WithExec([]string{"npx", "playwright", "install", "--with-deps"}).
		// WithExec([]string{"npm", "run", "test:e2e"})
		// WithExec([]string{"npx", "playwright", "test", "--workers", "4"})

	_, err = playwright.Stdout(ctx)
	if err != nil {
		panic(err)
	}

	log.Info().Msg("E2E test pipeline done.")
}
