package main

import (
	"context"
	"fmt"

	"github.com/docker/docker/api/types/mount"

	containerbuilder "github.com/dyrector-io/dyrectorio/agent/pkg/builder/container"
)

const PostgresImage = "docker.io/library/postgres:13-alpine"
const MailSlurperImage = "docker.io/oryd/mailslurper:latest-smtps"

const defaultCruxAgentGrpcPort = 5000
const defaultCruxGrpcPort = 5001
const defaultCruxUIPort = 3000
const defaultTraefikWebPort = 8000
const defaultTraefikUIPort = 8080
const defaultKratosPublicPort = 4433
const defaultKratosAdminPort = 4434
const defaultMailSlurperPort = 4436
const defaultMailSlurperPort2 = 4437

// Crux services: db migrations and crux api service
func GetCrux(settings *Settings) *containerbuilder.DockerContainerBuilder {
	crux := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(fmt.Sprintf("%s:%s", settings.Crux.Image, settings.SettingsFile.Version)).
		WithName(settings.Containers.Crux.Name).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithForcePullImage().
		WithEnv([]string{
			fmt.Sprintf("TZ=%s", settings.SettingsFile.TimeZone),
			fmt.Sprintf("DATABASE_URL=postgresql://%s:%s@%s:%d/%s?schema=public",
				settings.SettingsFile.CruxPostgresUser,
				settings.SettingsFile.CruxPostgresPassword,
				settings.Containers.CruxPostgres.Name,
				DefaultPostgresPort,
				settings.SettingsFile.CruxPostgresDB),
			fmt.Sprintf("KRATOS_ADMIN_URL=http://%s:%d",
				settings.Containers.Kratos.Name,
				settings.SettingsFile.KratosAdminPort),
			fmt.Sprintf("CRUX_UI_URL=localhost:%d", settings.SettingsFile.TraefikWebPort),
			fmt.Sprintf("CRUX_AGENT_ADDRESS=%s:%d", settings.Containers.Crux.Name, settings.SettingsFile.CruxAgentGrpcPort),
			"GRPC_API_INSECURE=true",
			"GRPC_AGENT_INSECURE=true",
			"GRPC_AGENT_INSTALL_SCRIPT_INSECURE=true",
			"LOCAL_DEPLOYMENT=true",
			fmt.Sprintf("LOCAL_DEPLOYMENT_NETWORK=%s", settings.SettingsFile.Network),
			fmt.Sprintf("JWT_SECRET=%s", settings.SettingsFile.CruxSecret),
			"CRUX_DOMAIN=DNS:localhost",
			"FROM_NAME=dyrector.io",
			"FROM_EMAIL=mail@example.com",
			fmt.Sprintf("SMTP_URI=%s:1025/?skip_ssl_verify=true&legacy_ssl=true", settings.Containers.MailSlurper.Name),
		}).
		WithPortBindings([]containerbuilder.PortBinding{
			{
				ExposedPort: defaultCruxAgentGrpcPort,
				PortBinding: uint16(settings.SettingsFile.CruxAgentGrpcPort),
			},
			{
				ExposedPort: defaultCruxGrpcPort,
				PortBinding: uint16(settings.SettingsFile.CruxGrpcPort),
			}}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithNetworkAliases(settings.Containers.Crux.Name).
		WithMountPoints([]mount.Mount{
			{
				Type:   mount.TypeVolume,
				Source: fmt.Sprintf("%s-certs", settings.Containers.Crux.Name),
				Target: "/app/certs",
			},
		}).
		WithCmd([]string{"serve"})
	return crux
}

func GetCruxMigrate(settings *Settings) *containerbuilder.DockerContainerBuilder {
	cruxMigrate := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(fmt.Sprintf("%s:%s", settings.Crux.Image, settings.SettingsFile.Version)).
		WithName(settings.Containers.CruxMigrate.Name).
		WithoutConflict().
		WithForcePullImage().
		WithEnv([]string{
			fmt.Sprintf("TZ=%s", settings.SettingsFile.TimeZone),
			fmt.Sprintf("DATABASE_URL=postgresql://%s:%s@%s:%d/%s?schema=public",
				settings.SettingsFile.CruxPostgresUser,
				settings.SettingsFile.CruxPostgresPassword,
				settings.Containers.CruxPostgres.Name,
				DefaultPostgresPort,
				settings.SettingsFile.CruxPostgresDB)}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithNetworkAliases(settings.Containers.CruxMigrate.Name).
		WithCmd([]string{"migrate"})

	return cruxMigrate
}

func GetCruxUI(settings *Settings) *containerbuilder.DockerContainerBuilder {
	cruxAPIAddress := fmt.Sprintf("CRUX_API_ADDRESS=%s:%d", settings.CruxUI.CruxAddr, settings.SettingsFile.CruxGrpcPort)
	if settings.SettingsFile.CruxDisabled {
		cruxAPIAddress = fmt.Sprintf("CRUX_API_ADDRESS=%s:%d", settings.InternalHostDomain, settings.SettingsFile.CruxGrpcPort)
	}

	cruxUI := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(fmt.Sprintf("%s:%s", settings.CruxUI.Image, settings.SettingsFile.Version)).
		WithName(settings.Containers.CruxUI.Name).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithForcePullImage().
		WithEnv([]string{
			fmt.Sprintf("TZ=%s", settings.SettingsFile.TimeZone),
			fmt.Sprintf("KRATOS_URL=http://%s:%d/kratos",
				settings.Containers.Traefik.Name,
				settings.SettingsFile.TraefikWebPort),
			fmt.Sprintf("KRATOS_ADMIN_URL=http://%s:%d",
				settings.Containers.Kratos.Name,
				settings.SettingsFile.KratosAdminPort),
			cruxAPIAddress,
			"CRUX_INSECURE=true",
			"DISABLE_RECAPTCHA=true",
		}).
		WithPortBindings([]containerbuilder.PortBinding{
			{
				ExposedPort: defaultCruxUIPort,
				PortBinding: uint16(settings.SettingsFile.CruxUIPort),
			}}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithNetworkAliases(settings.Containers.CruxUI.Name).
		WithMountPoints([]mount.Mount{
			{
				Type:     mount.TypeVolume,
				Source:   fmt.Sprintf("%s-certs", settings.Containers.Crux.Name),
				Target:   "/app/certs",
				ReadOnly: true,
			},
		}).
		WithLabels(map[string]string{
			"traefik.enable":                                         "true",
			"traefik.http.routers.crux-ui.rule":                      fmt.Sprintf("Host(`%s`)", "localhost"),
			"traefik.http.routers.crux-ui.entrypoints":               "web",
			"traefik.http.services.crux-ui.loadbalancer.server.port": fmt.Sprintf("%d", defaultCruxUIPort),
		})

	return cruxUI
}

// Return Traefik services container
func GetTraefik(settings *Settings) *containerbuilder.DockerContainerBuilder {
	socketEnv := os.Getenv("DOCKER_HOST")
	if socketEnv == "" {
		socketEnv = client.DefaultDockerHost
	}
	socket, err := url.ParseRequestURI(socketEnv)
	if err != nil {
		log.Fatalf("cannot determinte socker - %v", err)
	}

	commands := []string{
		"--log.level=INFO",
		"--api.insecure=true",
		"--providers.docker=true",
		"--providers.docker.exposedbydefault=false",
		fmt.Sprintf("--entrypoints.web.address=:%d", settings.SettingsFile.TraefikWebPort),
	}

	if settings.SettingsFile.CruxUIDisabled {
		commands = append(commands, "--providers.file.filename=/etc/traefik.dev.yml")
	}

	traefik := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage("docker.io/library/traefik:v2.8").
		WithName(settings.Containers.Traefik.Name).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithForcePullImage().
		WithPortBindings([]containerbuilder.PortBinding{
			{
				ExposedPort: defaultTraefikWebPort,
				PortBinding: uint16(settings.SettingsFile.TraefikWebPort),
			},
			{
				ExposedPort: defaultTraefikUIPort,
				PortBinding: uint16(settings.SettingsFile.TraefikUIPort),
			}}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithNetworkAliases(settings.Containers.Traefik.Name).
		WithMountPoints([]mount.Mount{{
			Type:   mount.TypeBind,
			Source: socket.Path,
			Target: "/var/run/docker.sock"}}).
		WithCmd(commands)

	return traefik
}

// Return Kratos services' containers
func GetKratos(settings *Settings) *containerbuilder.DockerContainerBuilder {
	kratos := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(fmt.Sprintf("%s:%s", settings.Kratos.Image, settings.SettingsFile.Version)).
		WithName(settings.Containers.Kratos.Name).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithForcePullImage().
		WithEnv([]string{
			"SQA_OPT_OUT=true",
			fmt.Sprintf("DSN=postgresql://%s:%s@%s:%d/%s?sslmode=disable&max_conns=20&max_idle_conns=4",
				settings.SettingsFile.KratosPostgresUser,
				settings.SettingsFile.KratosPostgresPassword,
				settings.Containers.KratosPostgres.Name,
				DefaultPostgresPort,
				settings.SettingsFile.KratosPostgresDB),
			fmt.Sprintf("KRATOS_URL=http://localhost:%d/kratos",
				settings.SettingsFile.TraefikWebPort),
			fmt.Sprintf("KRATOS_ADMIN_URL=http://%s:%d",
				settings.Containers.Kratos.Name,
				settings.SettingsFile.KratosAdminPort),
			fmt.Sprintf("AUTH_URL=http://%s:%d/auth",
				"localhost",
				settings.SettingsFile.TraefikWebPort),
			fmt.Sprintf("CRUX_UI_URL=http://%s:%d",
				"localhost",
				settings.SettingsFile.TraefikWebPort),
			"DEV=false",
			"LOG_LEVEL=info",
			"LOG_LEAK_SENSITIVE_VALUES=false",
			fmt.Sprintf("SECRETS_COOKIE=%s", settings.SettingsFile.KratosSecret),
			fmt.Sprintf("SMTP_URI=%s:1025/?skip_ssl_verify=true&legacy_ssl=true", settings.Containers.MailSlurper.Name),
			fmt.Sprintf("COURIER_SMTP_CONNECTION_URI=smtps://test:test@%s:1025/?skip_ssl_verify=true&legacy_ssl=true",
				settings.Containers.MailSlurper.Name),
		}).
		WithPortBindings([]containerbuilder.PortBinding{
			{
				ExposedPort: defaultKratosPublicPort,
				PortBinding: uint16(settings.SettingsFile.KratosPublicPort),
			},
			{
				ExposedPort: defaultKratosAdminPort,
				PortBinding: uint16(settings.SettingsFile.KratosAdminPort),
			}}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithNetworkAliases(settings.Containers.Kratos.Name).
		WithLabels(map[string]string{
			"traefik.enable": "true",
			"traefik.http.routers.kratos.rule": fmt.Sprintf("(Host(`localhost`) && PathPrefix(`/kratos`)) || (Host(`%s`) && PathPrefix(`/kratos`))",
				settings.Containers.Traefik.Name),
			"traefik.http.routers.kratos.entrypoints":                    "web",
			"traefik.http.services.kratos.loadbalancer.server.port":      fmt.Sprintf("%d", defaultKratosPublicPort),
			"traefik.http.middlewares.kratos-strip.stripprefix.prefixes": "/kratos",
			"traefik.http.routers.kratos.middlewares":                    "kratos-strip",
		})

	return kratos
}

func GetKratosMigrate(settings *Settings) *containerbuilder.DockerContainerBuilder {
	kratosMigrate := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(fmt.Sprintf("%s:%s", settings.Kratos.Image, settings.SettingsFile.Version)).
		WithName(settings.Containers.KratosMigrate.Name).
		WithoutConflict().
		WithForcePullImage().
		WithEnv([]string{
			"SQA_OPT_OUT=true",
			fmt.Sprintf("DSN=postgresql://%s:%s@%s:%d/%s?sslmode=disable&max_conns=20&max_idle_conns=4",
				settings.SettingsFile.KratosPostgresUser,
				settings.SettingsFile.KratosPostgresPassword,
				settings.Containers.KratosPostgres.Name,
				DefaultPostgresPort,
				settings.SettingsFile.KratosPostgresDB),
		}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithNetworkAliases(settings.Containers.KratosMigrate.Name).
		WithCmd([]string{"-c /etc/config/kratos/kratos.yaml", "migrate", "sql", "-e", "--yes"})

	return kratosMigrate
}

// Return Mailslurper services container
func GetMailSlurper(settings *Settings) *containerbuilder.DockerContainerBuilder {
	mailslurper := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(MailSlurperImage).
		WithName(settings.Containers.MailSlurper.Name).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithForcePullImage().
		WithPortBindings([]containerbuilder.PortBinding{
			{
				ExposedPort: defaultMailSlurperPort,
				PortBinding: uint16(settings.SettingsFile.MailSlurperPort),
			},
			{
				ExposedPort: defaultMailSlurperPort2,
				PortBinding: uint16(settings.SettingsFile.MailSlurperPort2),
			}}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithNetworkAliases(settings.Containers.MailSlurper.Name)

	return mailslurper
}

// Return Postgres services' containers
func GetCruxPostgres(settings *Settings) *containerbuilder.DockerContainerBuilder {
	cruxPostgres := GetBasePostgres(settings).
		WithName(settings.Containers.CruxPostgres.Name).
		WithNetworkAliases(settings.Containers.CruxPostgres.Name).
		WithEnv([]string{
			fmt.Sprintf("POSTGRES_USER=%s", settings.SettingsFile.CruxPostgresUser),
			fmt.Sprintf("POSTGRES_PASSWORD=%s", settings.SettingsFile.CruxPostgresPassword),
			fmt.Sprintf("POSTGRES_DB=%s", settings.SettingsFile.CruxPostgresDB),
		}).
		WithPortBindings([]containerbuilder.PortBinding{
			{
				ExposedPort: DefaultPostgresPort,
				PortBinding: uint16(settings.SettingsFile.CruxPostgresPort),
			}}).
		WithMountPoints([]mount.Mount{{
			Type:   mount.TypeVolume,
			Source: fmt.Sprintf("%s-data", settings.Containers.CruxPostgres.Name),
			Target: "/var/lib/postgresql/data"}})

	return cruxPostgres
}

func GetKratosPostgres(settings *Settings) *containerbuilder.DockerContainerBuilder {
	kratosPostgres := GetBasePostgres(settings).
		WithEnv([]string{
			fmt.Sprintf("POSTGRES_USER=%s", settings.SettingsFile.KratosPostgresUser),
			fmt.Sprintf("POSTGRES_PASSWORD=%s", settings.SettingsFile.KratosPostgresPassword),
			fmt.Sprintf("POSTGRES_DB=%s", settings.SettingsFile.KratosPostgresDB),
		}).
		WithPortBindings([]containerbuilder.PortBinding{
			{
				ExposedPort: DefaultPostgresPort,
				PortBinding: uint16(settings.SettingsFile.KratosPostgresPort),
			}}).
		WithName(settings.Containers.KratosPostgres.Name).
		WithNetworkAliases(settings.Containers.KratosPostgres.Name).
		WithMountPoints([]mount.Mount{
			{Type: mount.TypeVolume,
				Source: fmt.Sprintf("%s-data", settings.Containers.KratosPostgres.Name),
				Target: "/var/lib/postgresql/data"}})

	return kratosPostgres
}

// To remove some code duplication
func GetBasePostgres(settings *Settings) *containerbuilder.DockerContainerBuilder {
	basePostgres := containerbuilder.
		NewDockerBuilder(context.Background()).
		WithImage(PostgresImage).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithForcePullImage()

	return basePostgres
}
