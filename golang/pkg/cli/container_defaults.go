package cli

import (
	"context"
	"fmt"
	"net/url"
	"os"

	"github.com/AlekSi/pointer"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"

	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

const (
	PostgresImage    = "docker.io/library/postgres:13-alpine"
	MailSlurperImage = "docker.io/oryd/mailslurper:smtps-latest"
)

const (
	defaultCruxAgentGrpcPort   = 5000
	defaultCruxGrpcPort        = 5001
	defaultCruxHTTPPort        = 1848
	defaultCruxUIPort          = 3000
	defaultTraefikWebPort      = 8000
	defaultTraefikUIPort       = 8080
	defaultKratosPublicPort    = 4433
	defaultKratosAdminPort     = 4434
	defaultMailSlurperSMTPPort = 1025
	defaultMailSlurperWebPort  = 4436
	defaultMailSlurperWebPort2 = 4437
	defaultPostgresPort        = 5432
	cliStackName               = "dyrectorio-stack"
)

// Crux services: db migrations and crux api service
func GetCrux(settings *Settings) *containerbuilder.DockerContainerBuilder {
	host := localhost
	traefikhost := localhost
	if settings.FullyContainerized {
		host = settings.Containers.Crux.Name
		traefikhost = settings.Containers.Traefik.Name
	}

	cruxAgentAddr := fmt.Sprintf("%s:%d", settings.Containers.Crux.Name, defaultCruxAgentGrpcPort)
	if settings.Containers.Crux.LocalAgent {
		cruxAgentAddr = fmt.Sprintf("%s:%d", host, settings.SettingsFile.CruxAgentGrpcPort)
	}

	crux := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(TryImage(fmt.Sprintf("%s:%s", settings.Crux.Image, settings.SettingsFile.Version), settings.SpecialImageTag)).
		WithLogWriter(nil).
		WithName(settings.Containers.Crux.Name).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithEnv([]string{
			fmt.Sprintf("TZ=%s", settings.SettingsFile.TimeZone),
			fmt.Sprintf("NODE_ENV=%s", "development"),
			fmt.Sprintf("DATABASE_URL=postgresql://%s:%s@%s:%d/%s?schema=public",
				settings.SettingsFile.CruxPostgresUser,
				settings.SettingsFile.CruxPostgresPassword,
				settings.Containers.CruxPostgres.Name,
				defaultPostgresPort,
				settings.SettingsFile.CruxPostgresDB),
			fmt.Sprintf("KRATOS_ADMIN_URL=http://%s:%d",
				settings.Containers.Kratos.Name,
				settings.SettingsFile.KratosAdminPort),
			fmt.Sprintf("CRUX_UI_URL=%s:%d", traefikhost, settings.SettingsFile.TraefikWebPort),
			fmt.Sprintf("CRUX_AGENT_ADDRESS=%s", cruxAgentAddr),
			"LOCAL_DEPLOYMENT=true",
			fmt.Sprintf("LOCAL_DEPLOYMENT_NETWORK=%s", settings.SettingsFile.Network),
			fmt.Sprintf("JWT_SECRET=%s", settings.SettingsFile.CruxSecret),
			"FROM_NAME=dyrector.io",
			"FROM_EMAIL=mail@example.com",
			fmt.Sprintf("SMTP_URI=%s:1025/?skip_ssl_verify=true&legacy_ssl=true", settings.Containers.MailSlurper.Name),
			fmt.Sprintf("CRUX_AGENT_IMAGE=%s", settings.ImageTag),
		}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithNetworkAliases(settings.Containers.Crux.Name).
		WithCmd([]string{"serve"}).
		WithLabels(map[string]string{
			"com.docker.compose.project": cliStackName,
			"com.docker.compose.service": settings.Containers.Crux.Name,
		})

	if !settings.FullyContainerized {
		crux = crux.
			WithPortBindings([]containerbuilder.PortBinding{
				{
					ExposedPort: defaultCruxAgentGrpcPort,
					PortBinding: pointer.ToUint16(uint16(settings.SettingsFile.CruxAgentGrpcPort)),
				},
				{
					ExposedPort: defaultCruxGrpcPort,
					PortBinding: pointer.ToUint16(uint16(settings.SettingsFile.CruxGrpcPort)),
				},
				{
					ExposedPort: defaultCruxHTTPPort,
					PortBinding: pointer.ToUint16(uint16(settings.SettingsFile.CruxHTTPPort)),
				},
			})
	}

	if settings.DisableForcepull {
		return crux
	}

	return crux.WithForcePullImage()
}

func GetCruxMigrate(settings *Settings) *containerbuilder.DockerContainerBuilder {
	cruxMigrate := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(TryImage(fmt.Sprintf("%s:%s", settings.Crux.Image, settings.SettingsFile.Version), settings.SpecialImageTag)).
		WithLogWriter(nil).
		WithName(settings.Containers.CruxMigrate.Name).
		WithoutConflict().
		WithEnv([]string{
			fmt.Sprintf("TZ=%s", settings.SettingsFile.TimeZone),
			fmt.Sprintf("DATABASE_URL=postgresql://%s:%s@%s:%d/%s?schema=public",
				settings.SettingsFile.CruxPostgresUser,
				settings.SettingsFile.CruxPostgresPassword,
				settings.Containers.CruxPostgres.Name,
				defaultPostgresPort,
				settings.SettingsFile.CruxPostgresDB),
		}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithNetworkAliases(settings.Containers.CruxMigrate.Name).
		WithCmd([]string{"migrate"}).
		WithLabels(map[string]string{
			"com.docker.compose.project": cliStackName,
			"com.docker.compose.service": settings.Containers.CruxMigrate.Name,
		})

	if settings.DisableForcepull {
		return cruxMigrate
	}

	return cruxMigrate.WithForcePullImage()
}

func GetCruxUI(settings *Settings) *containerbuilder.DockerContainerBuilder {
	cruxAPIAddress := fmt.Sprintf("CRUX_API_ADDRESS=%s:%d", settings.CruxUI.CruxAddr, settings.SettingsFile.CruxGrpcPort)
	if settings.SettingsFile.CruxDisabled {
		cruxAPIAddress = fmt.Sprintf("CRUX_API_ADDRESS=%s:%d", settings.InternalHostDomain, settings.SettingsFile.CruxGrpcPort)
	}

	cruxUI := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(TryImage(fmt.Sprintf("%s:%s", settings.CruxUI.Image, settings.SettingsFile.Version), settings.SpecialImageTag)).
		WithLogWriter(nil).
		WithName(settings.Containers.CruxUI.Name).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithEnv([]string{
			fmt.Sprintf("TZ=%s", settings.SettingsFile.TimeZone),
			fmt.Sprintf("KRATOS_URL=http://%s:%d/kratos",
				settings.Containers.Traefik.Name,
				defaultTraefikWebPort),
			fmt.Sprintf("KRATOS_ADMIN_URL=http://%s:%d",
				settings.Containers.Kratos.Name,
				settings.SettingsFile.KratosAdminPort),
			cruxAPIAddress,
			"DISABLE_RECAPTCHA=true",
		}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithNetworkAliases(settings.Containers.CruxUI.Name).
		WithLabels(map[string]string{
			"traefik.enable": "true",
			"traefik.http.routers.crux-ui.rule": fmt.Sprintf("Host(`localhost`) || Host(`%s`) || Host(`%s`)", settings.InternalHostDomain,
				settings.Containers.Traefik.Name),
			"traefik.http.routers.crux-ui.entrypoints":               "web",
			"traefik.http.services.crux-ui.loadbalancer.server.port": fmt.Sprintf("%d", defaultCruxUIPort),
			"com.docker.compose.project":                             cliStackName,
			"com.docker.compose.service":                             settings.Containers.CruxUI.Name,
		})

	if !settings.FullyContainerized {
		cruxUI = cruxUI.
			WithPortBindings([]containerbuilder.PortBinding{
				{
					ExposedPort: defaultCruxUIPort,
					PortBinding: pointer.ToUint16(uint16(settings.SettingsFile.CruxUIPort)),
				},
			})
	}

	if settings.DisableForcepull {
		return cruxUI
	}

	return cruxUI.WithForcePullImage()
}

// Return Traefik services container
func GetTraefik(settings *Settings) *containerbuilder.DockerContainerBuilder {
	envDockerHost := os.Getenv("DOCKER_HOST")

	socket, err := url.Parse(client.DefaultDockerHost)
	if err != nil {
		log.Fatal().Err(err).Stack().Str("host", client.DefaultDockerHost).Msg("Failed to parse Docker host")
	}

	// If traefik's socket is default, but we override it in the environment we prefer the environment
	if settings.SettingsFile.TraefikDockerSocket == socket.Path && envDockerHost != "" {
		socket, err = url.Parse(envDockerHost)
		if err != nil {
			log.Fatal().Err(err).Stack().Str("host", envDockerHost).Msg("Failed to parse Docker host from environment")
		}
		settings.SettingsFile.TraefikDockerSocket = socket.Path
	}

	commands := []string{
		"--log.level=INFO",
		"--api.insecure=true",
		"--providers.docker=true",
		"--providers.docker.exposedbydefault=false",
		fmt.Sprintf("--entrypoints.web.address=:%d", defaultTraefikWebPort),
	}

	if settings.SettingsFile.CruxUIDisabled {
		commands = append(commands, "--providers.file.directory=/etc/traefik", "--providers.file.watch=true")
	}

	mountType := mount.TypeBind
	if settings.SettingsFile.TraefikIsDockerSocketNamedPipe {
		mountType = mount.TypeNamedPipe
	}

	traefik := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage("docker.io/library/traefik:v2.9").
		WithLogWriter(nil).
		WithName(settings.Containers.Traefik.Name).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithNetworkAliases(settings.Containers.Traefik.Name).
		WithMountPoints([]mount.Mount{{
			Type:   mountType,
			Source: settings.SettingsFile.TraefikDockerSocket,
			Target: "/var/run/docker.sock",
		}}).
		WithCmd(commands).
		WithLabels(map[string]string{
			"com.docker.compose.project": cliStackName,
			"com.docker.compose.service": settings.Containers.Traefik.Name,
		})

	if !settings.FullyContainerized {
		traefik = traefik.
			WithPortBindings([]containerbuilder.PortBinding{
				{
					ExposedPort: defaultTraefikWebPort,
					PortBinding: pointer.ToUint16(uint16(settings.SettingsFile.TraefikWebPort)),
				},
				{
					ExposedPort: defaultTraefikUIPort,
					PortBinding: pointer.ToUint16(uint16(settings.SettingsFile.TraefikUIPort)),
				},
			})
	}
	return traefik
}

// Return Kratos services' containers
func GetKratos(settings *Settings) *containerbuilder.DockerContainerBuilder {
	traefikhost := localhost
	if settings.FullyContainerized {
		traefikhost = settings.Containers.Traefik.Name
	}

	kratos := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(TryImage(fmt.Sprintf("%s:%s", settings.Kratos.Image, settings.SettingsFile.Version), settings.SpecialImageTag)).
		WithLogWriter(nil).
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
				defaultPostgresPort,
				settings.SettingsFile.KratosPostgresDB),
			fmt.Sprintf("KRATOS_URL=http://%s:%d/kratos",
				traefikhost,
				settings.SettingsFile.TraefikWebPort),
			fmt.Sprintf("KRATOS_ADMIN_URL=http://%s:%d",
				settings.Containers.Kratos.Name,
				settings.SettingsFile.KratosAdminPort),
			fmt.Sprintf("AUTH_URL=http://%s:%d/auth",
				traefikhost,
				settings.SettingsFile.TraefikWebPort),
			fmt.Sprintf("CRUX_UI_URL=http://%s:%d",
				traefikhost,
				settings.SettingsFile.TraefikWebPort),
			"DEV=true",
			"LOG_LEVEL=info",
			"LOG_LEAK_SENSITIVE_VALUES=false",
			fmt.Sprintf("SECRETS_COOKIE=%s", settings.SettingsFile.KratosSecret),
			fmt.Sprintf("SMTP_URI=%s:1025/?skip_ssl_verify=true&legacy_ssl=true", settings.Containers.MailSlurper.Name),
			fmt.Sprintf("COURIER_SMTP_CONNECTION_URI=smtps://test:test@%s:1025/?skip_ssl_verify=true&legacy_ssl=true",
				settings.Containers.MailSlurper.Name),
		}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithNetworkAliases(settings.Containers.Kratos.Name).
		WithLabels(map[string]string{
			"traefik.enable": "true",
			"traefik.http.routers.kratos.rule": fmt.Sprintf("(Host(`localhost`) && PathPrefix(`/kratos`)) || "+
				"(Host(`%s`) && PathPrefix(`/kratos`)) || "+
				"(Host(`%s`) && PathPrefix(`/kratos`))",
				settings.Containers.Traefik.Name, settings.InternalHostDomain),
			"traefik.http.routers.kratos.entrypoints":                    "web",
			"traefik.http.services.kratos.loadbalancer.server.port":      fmt.Sprintf("%d", defaultKratosPublicPort),
			"traefik.http.middlewares.kratos-strip.stripprefix.prefixes": "/kratos",
			"traefik.http.routers.kratos.middlewares":                    "kratos-strip",
			"com.docker.compose.project":                                 cliStackName,
			"com.docker.compose.service":                                 settings.Containers.Kratos.Name,
		})

	if !settings.FullyContainerized {
		kratos = kratos.
			WithPortBindings([]containerbuilder.PortBinding{
				{
					ExposedPort: defaultKratosPublicPort,
					PortBinding: pointer.ToUint16(uint16(settings.SettingsFile.KratosPublicPort)),
				},
				{
					ExposedPort: defaultKratosAdminPort,
					PortBinding: pointer.ToUint16(uint16(settings.SettingsFile.KratosAdminPort)),
				},
			})
	}

	if settings.DisableForcepull {
		return kratos
	}

	return kratos.WithForcePullImage()
}

func GetKratosMigrate(settings *Settings) *containerbuilder.DockerContainerBuilder {
	kratosMigrate := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(TryImage(fmt.Sprintf("%s:%s", settings.Kratos.Image, settings.SettingsFile.Version), settings.SpecialImageTag)).
		WithLogWriter(nil).
		WithName(settings.Containers.KratosMigrate.Name).
		WithoutConflict().
		WithForcePullImage().
		WithEnv([]string{
			"SQA_OPT_OUT=true",
			fmt.Sprintf("DSN=postgresql://%s:%s@%s:%d/%s?sslmode=disable&max_conns=20&max_idle_conns=4",
				settings.SettingsFile.KratosPostgresUser,
				settings.SettingsFile.KratosPostgresPassword,
				settings.Containers.KratosPostgres.Name,
				defaultPostgresPort,
				settings.SettingsFile.KratosPostgresDB),
		}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithNetworkAliases(settings.Containers.KratosMigrate.Name).
		WithCmd([]string{"-c /etc/config/kratos/kratos.yaml", "migrate", "sql", "-e", "--yes"}).
		WithLabels(map[string]string{
			"com.docker.compose.project": cliStackName,
			"com.docker.compose.service": settings.Containers.KratosMigrate.Name,
		})

	if settings.DisableForcepull {
		return kratosMigrate
	}

	return kratosMigrate.WithForcePullImage()
}

// Return Mailslurper services container
func GetMailSlurper(settings *Settings) *containerbuilder.DockerContainerBuilder {
	mailslurper := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(MailSlurperImage).
		WithLogWriter(nil).
		WithName(settings.Containers.MailSlurper.Name).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithForcePullImage().
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithNetworkAliases(settings.Containers.MailSlurper.Name).
		WithLabels(map[string]string{
			"com.docker.compose.project": cliStackName,
			"com.docker.compose.service": settings.Containers.MailSlurper.Name,
		})

	if !settings.FullyContainerized {
		mailslurper = mailslurper.
			WithPortBindings([]containerbuilder.PortBinding{
				{
					ExposedPort: defaultMailSlurperSMTPPort,
					PortBinding: pointer.ToUint16(uint16(settings.SettingsFile.MailSlurperSMTPPort)),
				},
				{
					ExposedPort: defaultMailSlurperWebPort,
					PortBinding: pointer.ToUint16(uint16(settings.SettingsFile.MailSlurperWebPort)),
				},
				{
					ExposedPort: defaultMailSlurperWebPort2,
					PortBinding: pointer.ToUint16(uint16(settings.SettingsFile.MailSlurperWebPort2)),
				},
			})
	}
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
		WithLabels(map[string]string{
			"com.docker.compose.project": cliStackName,
			"com.docker.compose.service": settings.Containers.CruxPostgres.Name,
		})

	if !settings.FullyContainerized {
		cruxPostgres = cruxPostgres.
			WithPortBindings([]containerbuilder.PortBinding{
				{
					ExposedPort: defaultPostgresPort,
					PortBinding: pointer.ToUint16(uint16(settings.SettingsFile.CruxPostgresPort)),
				},
			}).
			WithMountPoints([]mount.Mount{{
				Type:   mount.TypeVolume,
				Source: fmt.Sprintf("%s-data", settings.Containers.CruxPostgres.Name),
				Target: "/var/lib/postgresql/data",
			}})
	}

	return cruxPostgres
}

func GetKratosPostgres(settings *Settings) *containerbuilder.DockerContainerBuilder {
	kratosPostgres := GetBasePostgres(settings).
		WithEnv([]string{
			fmt.Sprintf("POSTGRES_USER=%s", settings.SettingsFile.KratosPostgresUser),
			fmt.Sprintf("POSTGRES_PASSWORD=%s", settings.SettingsFile.KratosPostgresPassword),
			fmt.Sprintf("POSTGRES_DB=%s", settings.SettingsFile.KratosPostgresDB),
		}).
		WithName(settings.Containers.KratosPostgres.Name).
		WithNetworkAliases(settings.Containers.KratosPostgres.Name).
		WithLabels(map[string]string{
			"com.docker.compose.project": cliStackName,
			"com.docker.compose.service": settings.Containers.KratosPostgres.Name,
		})

	if !settings.FullyContainerized {
		kratosPostgres = kratosPostgres.
			WithPortBindings([]containerbuilder.PortBinding{
				{
					ExposedPort: defaultPostgresPort,
					PortBinding: pointer.ToUint16(uint16(settings.SettingsFile.KratosPostgresPort)),
				},
			}).
			WithMountPoints([]mount.Mount{
				{
					Type:   mount.TypeVolume,
					Source: fmt.Sprintf("%s-data", settings.Containers.KratosPostgres.Name),
					Target: "/var/lib/postgresql/data",
				},
			})
	}

	return kratosPostgres
}

// To remove some code duplication
func GetBasePostgres(settings *Settings) *containerbuilder.DockerContainerBuilder {
	basePostgres := containerbuilder.
		NewDockerBuilder(context.Background()).
		WithLogWriter(nil).
		WithImage(PostgresImage).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithForcePullImage().
		WithoutConflict()

	return basePostgres
}
