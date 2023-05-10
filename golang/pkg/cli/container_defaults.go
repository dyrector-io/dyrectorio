package cli

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"net/url"
	"os"
	"strings"
	"text/template"

	"github.com/AlekSi/pointer"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/label"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	dagentutils "github.com/dyrector-io/dyrectorio/golang/pkg/dagent/utils"
)

const (
	PostgresImage    = "docker.io/library/postgres:13-alpine"
	MailSlurperImage = "docker.io/oryd/mailslurper:smtps-latest"
)

const (
	defaultCruxAgentGrpcPort   = 5000
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
)

// GetCrux services: db migrations and crux api service
func GetCrux(state *State, args *ArgsFlags) containerbuilder.Builder {
	crux := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(TryImage(fmt.Sprintf("%s:%s", state.Crux.Image, state.SettingsFile.Version), args.SpecialImageTag)).
		WithLogWriter(nil).
		WithName(state.Containers.Crux.Name).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithEnv(getCruxEnvs(state, args)).
		WithNetworks([]string{state.SettingsFile.Network}).
		WithNetworkAliases(state.Containers.Crux.Name).
		WithCmd([]string{"serve"}).
		WithLabels(map[string]string{
			"traefik.enable": "true",
			"traefik.http.routers.crux.rule": fmt.Sprintf("(Host(`localhost`) || Host(`%s`) || Host(`%s`)) && "+
				"PathPrefix(`/api`) && !PathPrefix(`/api/auth`) && !PathPrefix(`/api/status`) ",
				state.Containers.Traefik.Name, state.InternalHostDomain),
			"traefik.http.routers.crux.entrypoints":               "web",
			"traefik.http.services.crux.loadbalancer.server.port": fmt.Sprintf("%d", defaultCruxHTTPPort),
			"com.docker.compose.project":                          args.Prefix,
			"com.docker.compose.service":                          state.Containers.Crux.Name,
			label.DyrectorioOrg + label.ContainerPrefix:           args.Prefix,
		}).
		WithPreStartHooks(getCruxInitContainer(state, args))

	if !args.FullyContainerized {
		crux = crux.
			WithPortBindings([]containerbuilder.PortBinding{
				{
					ExposedPort: defaultCruxAgentGrpcPort,
					PortBinding: pointer.ToUint16(uint16(state.SettingsFile.CruxAgentGrpcPort)),
				},
				{
					ExposedPort: defaultCruxHTTPPort,
					PortBinding: pointer.ToUint16(uint16(state.SettingsFile.CruxHTTPPort)),
				},
			})
	}

	if args.DisableForcepull {
		return crux
	}

	return crux.WithForcePullImage()
}

func getCruxInitContainer(state *State, args *ArgsFlags) containerbuilder.LifecycleFunc {
	return func(ctx context.Context, client client.APIClient,
		containerName string, containerId *string, mountList []mount.Mount, logger *io.StringWriter,
	) error {
		cruxMigrate := containerbuilder.NewDockerBuilder(context.Background()).
			WithImage(TryImage(fmt.Sprintf("%s:%s", state.Crux.Image, state.SettingsFile.Version), args.SpecialImageTag)).
			WithLogWriter(nil).
			WithName(state.Containers.CruxMigrate.Name).
			WithoutConflict().
			WithEnv([]string{
				fmt.Sprintf("TZ=%s", state.SettingsFile.TimeZone),
				fmt.Sprintf("DATABASE_URL=postgresql://%s:%s@%s:%d/%s?schema=public",
					state.SettingsFile.CruxPostgresUser,
					state.SettingsFile.CruxPostgresPassword,
					state.Containers.CruxPostgres.Name,
					defaultPostgresPort,
					state.SettingsFile.CruxPostgresDB),
			}).
			WithNetworks([]string{state.SettingsFile.Network}).
			WithNetworkAliases(state.Containers.CruxMigrate.Name).
			WithCmd([]string{"migrate"}).
			WithLabels(map[string]string{
				"com.docker.compose.project":                args.Prefix,
				"com.docker.compose.service":                state.Containers.CruxMigrate.Name,
				label.DyrectorioOrg + label.ContainerPrefix: args.Prefix,
			})

		if !args.DisableForcepull {
			cruxMigrate = cruxMigrate.WithForcePullImage()
		}

		cont, res, err := cruxMigrate.CreateAndStartWaitUntilExit()
		if err != nil {
			return errors.Join(err, fmt.Errorf("container %s exited with code: %d", cont.GetName(), res.StatusCode))
		}
		log.Info().Str("initContainer", cont.GetName()).Msgf("Started")
		return nil
	}
}

func getCruxEnvs(state *State, args *ArgsFlags) []string {
	host := localhost
	traefikHost := localhost
	if args.FullyContainerized {
		host = state.Containers.Crux.Name
		traefikHost = state.Containers.Traefik.Name
	}

	cruxAgentAddr := fmt.Sprintf("%s:%d", state.Containers.Crux.Name, defaultCruxAgentGrpcPort)
	if args.LocalAgent {
		cruxAgentAddr = fmt.Sprintf("%s:%d", host, state.SettingsFile.CruxAgentGrpcPort)
	}
	return []string{
		fmt.Sprintf("TZ=%s", state.SettingsFile.TimeZone),
		fmt.Sprintf("NODE_ENV=%s", "development"),
		fmt.Sprintf("DATABASE_URL=postgresql://%s:%s@%s:%d/%s?schema=public",
			state.SettingsFile.CruxPostgresUser,
			state.SettingsFile.CruxPostgresPassword,
			state.Containers.CruxPostgres.Name,
			defaultPostgresPort,
			state.SettingsFile.CruxPostgresDB),
		fmt.Sprintf("KRATOS_URL=http://%s:%d/kratos",
			state.Containers.Traefik.Name,
			defaultTraefikWebPort),
		fmt.Sprintf("KRATOS_ADMIN_URL=http://%s:%d",
			state.Containers.Kratos.Name,
			state.SettingsFile.KratosAdminPort),
		fmt.Sprintf("CRUX_UI_URL=http://%s:%d", traefikHost, state.SettingsFile.TraefikWebPort),
		fmt.Sprintf("CRUX_AGENT_ADDRESS=%s", cruxAgentAddr),
		"LOCAL_DEPLOYMENT=true",
		fmt.Sprintf("CRUX_AGENT_IMAGE=%s", state.SettingsFile.Version),
		fmt.Sprintf("LOCAL_DEPLOYMENT_NETWORK=%s", state.SettingsFile.Network),
		fmt.Sprintf("JWT_SECRET=%s", state.SettingsFile.CruxSecret),
		fmt.Sprintf("FROM_NAME=%s", state.SettingsFile.MailFromName),
		fmt.Sprintf("FROM_EMAIL=%s", state.SettingsFile.MailFromEmail),
		fmt.Sprintf("SMTP_URI=%s:1025/?skip_ssl_verify=true&legacy_ssl=true", state.Containers.MailSlurper.Name),
		fmt.Sprintf("AGENT_INSTALL_SCRIPT_DISABLE_PULL=%t", args.DisableForcepull),
		"DISABLE_RECAPTCHA=true",
	}
}

// GetCruxUI returns a configured crux-ui service
func GetCruxUI(state *State, args *ArgsFlags) containerbuilder.Builder {
	traefikHost := localhost
	if args.FullyContainerized {
		traefikHost = state.Containers.Traefik.Name
	}

	cruxUI := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(TryImage(fmt.Sprintf("%s:%s", state.CruxUI.Image, state.SettingsFile.Version), args.SpecialImageTag)).
		WithLogWriter(nil).
		WithName(state.Containers.CruxUI.Name).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithEnv([]string{
			fmt.Sprintf("TZ=%s", state.SettingsFile.TimeZone),
			fmt.Sprintf("CRUX_UI_URL=http://%s:%d", traefikHost, state.SettingsFile.TraefikWebPort),
			fmt.Sprintf("CRUX_URL=http://%s:%d", state.Containers.Traefik.Name, state.SettingsFile.TraefikWebPort),
			fmt.Sprintf("KRATOS_URL=http://%s:%d/kratos",
				state.Containers.Traefik.Name,
				defaultTraefikWebPort),
			fmt.Sprintf("KRATOS_ADMIN_URL=http://%s:%d",
				state.Containers.Kratos.Name,
				state.SettingsFile.KratosAdminPort),
			"DISABLE_RECAPTCHA=true",
		}).
		WithNetworks([]string{state.SettingsFile.Network}).
		WithNetworkAliases(state.Containers.CruxUI.Name).
		WithLabels(map[string]string{
			"traefik.enable": "true",
			"traefik.http.routers.crux-ui.rule": fmt.Sprintf("Host(`%s`) || Host(`%s`) || Host(`%s`)", traefikHost, state.InternalHostDomain,
				state.Containers.Traefik.Name),
			"traefik.http.routers.crux-ui.entrypoints":               "web",
			"traefik.http.services.crux-ui.loadbalancer.server.port": fmt.Sprintf("%d", defaultCruxUIPort),
			"com.docker.compose.project":                             args.Prefix,
			"com.docker.compose.service":                             state.Containers.CruxUI.Name,
			label.DyrectorioOrg + label.ContainerPrefix:              args.Prefix,
		})

	if !args.FullyContainerized {
		cruxUI = cruxUI.
			WithPortBindings([]containerbuilder.PortBinding{
				{
					ExposedPort: defaultCruxUIPort,
					PortBinding: pointer.ToUint16(uint16(state.SettingsFile.CruxUIPort)),
				},
			})
	}

	if args.DisableForcepull {
		return cruxUI
	}

	return cruxUI.WithForcePullImage()
}

// GetTraefik returns a traefik services container
func GetTraefik(state *State, args *ArgsFlags) containerbuilder.Builder {
	envDockerHost := os.Getenv("DOCKER_HOST")

	socket, err := url.Parse(client.DefaultDockerHost)
	if err != nil {
		log.Fatal().Err(err).Stack().Str("host", client.DefaultDockerHost).Msg("Failed to parse Docker host")
	}

	// If traefik's socket is default, but we override it in the environment we prefer the environment
	if state.SettingsFile.TraefikDockerSocket == socket.Path && envDockerHost != "" {
		socket, err = url.Parse(envDockerHost)
		if err != nil {
			log.Fatal().Err(err).Stack().Str("host", envDockerHost).Msg("Failed to parse Docker host from environment")
		}
		state.SettingsFile.TraefikDockerSocket = socket.Path
	}

	commands := []string{
		"--log.level=INFO",
		"--api.insecure=true",
		"--providers.docker=true",
		"--providers.docker.exposedbydefault=false",
		fmt.Sprintf("--entrypoints.web.address=:%d", defaultTraefikWebPort),
	}

	if args.CruxUIDisabled {
		commands = append(commands, "--providers.file.directory=/etc/traefik", "--providers.file.watch=true")
	}

	mountType := mount.TypeBind
	if state.SettingsFile.TraefikIsDockerSocketNamedPipe {
		mountType = mount.TypeNamedPipe
	}

	traefik := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage("docker.io/library/traefik:v2.9").
		WithLogWriter(nil).
		WithName(state.Containers.Traefik.Name).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithNetworks([]string{state.SettingsFile.Network}).
		WithNetworkAliases(state.Containers.Traefik.Name).
		WithMountPoints([]mount.Mount{{
			Type:   mountType,
			Source: state.SettingsFile.TraefikDockerSocket,
			Target: "/var/run/docker.sock",
		}}).
		WithCmd(commands).
		WithLabels(map[string]string{
			"com.docker.compose.project":                args.Prefix,
			"com.docker.compose.service":                state.Containers.Traefik.Name,
			label.DyrectorioOrg + label.ContainerPrefix: args.Prefix,
		}).
		WithPostStartHooks(func(ctx context.Context, client client.APIClient,
			containerName string, containerId *string, mountList []mount.Mount, logger *io.StringWriter,
		) error {
			return CopyTraefikConfiguration(
				ctx,
				containerName,
				state.InternalHostDomain,
				state.SettingsFile.CruxHTTPPort,
				state.SettingsFile.CruxUIPort,
			)
		})

	if !args.FullyContainerized {
		traefik = traefik.
			WithPortBindings([]containerbuilder.PortBinding{
				{
					ExposedPort: defaultTraefikWebPort,
					PortBinding: pointer.ToUint16(uint16(state.SettingsFile.TraefikWebPort)),
				},
				{
					ExposedPort: defaultTraefikUIPort,
					PortBinding: pointer.ToUint16(uint16(state.SettingsFile.TraefikUIPort)),
				},
			})
	}
	return traefik
}

// Return Kratos services' containers
func GetKratos(state *State, args *ArgsFlags) containerbuilder.Builder {
	kratos := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(TryImage(fmt.Sprintf("%s:%s", state.Kratos.Image, state.SettingsFile.Version), args.SpecialImageTag)).
		WithLogWriter(nil).
		WithName(state.Containers.Kratos.Name).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithEnv(GetKratosEnvs(state, args)).
		WithNetworks([]string{state.SettingsFile.Network}).
		WithNetworkAliases(state.Containers.Kratos.Name).
		WithLabels(map[string]string{
			"traefik.enable": "true",
			"traefik.http.routers.kratos.rule": fmt.Sprintf("(Host(`localhost`) || Host(`%s`) || Host(`%s`)) && "+
				"PathPrefix(`/kratos`)", state.Containers.Traefik.Name, state.InternalHostDomain),
			"traefik.http.routers.kratos.entrypoints":                    "web",
			"traefik.http.services.kratos.loadbalancer.server.port":      fmt.Sprintf("%d", defaultKratosPublicPort),
			"traefik.http.middlewares.kratos-strip.stripprefix.prefixes": "/kratos",
			"traefik.http.routers.kratos.middlewares":                    "kratos-strip",
			"com.docker.compose.project":                                 args.Prefix,
			"com.docker.compose.service":                                 state.Containers.Kratos.Name,
			label.DyrectorioOrg + label.ContainerPrefix:                  args.Prefix,
		}).
		WithPreStartHooks(getKratosInitContainer(state, args))

	if !args.FullyContainerized {
		kratos = kratos.
			WithPortBindings([]containerbuilder.PortBinding{
				{
					ExposedPort: defaultKratosPublicPort,
					PortBinding: pointer.ToUint16(uint16(state.SettingsFile.KratosPublicPort)),
				},
				{
					ExposedPort: defaultKratosAdminPort,
					PortBinding: pointer.ToUint16(uint16(state.SettingsFile.KratosAdminPort)),
				},
			})
	}

	if args.DisableForcepull {
		return kratos
	}

	return kratos.WithForcePullImage()
}

func getKratosInitContainer(state *State, args *ArgsFlags) containerbuilder.LifecycleFunc {
	return func(ctx context.Context, client client.APIClient, containerName string,
		containerId *string, mountList []mount.Mount, logger *io.StringWriter,
	) error {
		kratosMigrate := containerbuilder.NewDockerBuilder(context.Background()).
			WithImage(TryImage(fmt.Sprintf("%s:%s", state.Kratos.Image, state.SettingsFile.Version), args.SpecialImageTag)).
			WithLogWriter(nil).
			WithName(state.Containers.KratosMigrate.Name).
			WithoutConflict().
			WithEnv([]string{
				"SQA_OPT_OUT=true",
				fmt.Sprintf("DSN=postgresql://%s:%s@%s:%d/%s?sslmode=disable&max_conns=20&max_idle_conns=4",
					state.SettingsFile.KratosPostgresUser,
					state.SettingsFile.KratosPostgresPassword,
					state.Containers.KratosPostgres.Name,
					defaultPostgresPort,
					state.SettingsFile.KratosPostgresDB),
			}).
			WithNetworks([]string{state.SettingsFile.Network}).
			WithNetworkAliases(state.Containers.KratosMigrate.Name).
			WithCmd([]string{"-c /etc/config/kratos/kratos.yaml", "migrate", "sql", "-e", "--yes"}).
			WithLabels(map[string]string{
				"com.docker.compose.project":                args.Prefix,
				"com.docker.compose.service":                state.Containers.KratosMigrate.Name,
				label.DyrectorioOrg + label.ContainerPrefix: args.Prefix,
			})

		if !args.DisableForcepull {
			kratosMigrate = kratosMigrate.WithForcePullImage()
		}

		cont, res, err := kratosMigrate.CreateAndStartWaitUntilExit()
		if err != nil {
			return errors.Join(err, fmt.Errorf("container %s exited with code: %d", cont.GetName(), res.StatusCode))
		}
		log.Info().Str("initContainer", cont.GetName()).Msgf("Started")
		return nil
	}
}

func GetKratosEnvs(state *State, args *ArgsFlags) []string {
	traefikHost := localhost

	return []string{
		"SQA_OPT_OUT=true",
		fmt.Sprintf("DSN=postgresql://%s:%s@%s:%d/%s?sslmode=disable&max_conns=20&max_idle_conns=4",
			state.SettingsFile.KratosPostgresUser,
			state.SettingsFile.KratosPostgresPassword,
			state.Containers.KratosPostgres.Name,
			defaultPostgresPort,
			state.SettingsFile.KratosPostgresDB),
		fmt.Sprintf("KRATOS_URL=http://%s:%d/kratos",
			traefikHost,
			state.SettingsFile.TraefikWebPort),
		fmt.Sprintf("KRATOS_ADMIN_URL=http://%s:%d",
			state.Containers.Kratos.Name,
			state.SettingsFile.KratosAdminPort),
		fmt.Sprintf("AUTH_URL=http://%s:%d/auth",
			traefikHost,
			state.SettingsFile.TraefikWebPort),
		fmt.Sprintf("CRUX_UI_URL=http://%s:%d",
			traefikHost,
			state.SettingsFile.TraefikWebPort),
		"DEV=true",
		"LOG_LEVEL=info",
		"LOG_LEAK_SENSITIVE_VALUES=false",
		fmt.Sprintf("SECRETS_COOKIE=%s", state.SettingsFile.KratosSecret),
		fmt.Sprintf("SMTP_URI=%s:1025/?skip_ssl_verify=true&legacy_ssl=true", state.Containers.MailSlurper.Name),
		fmt.Sprintf("COURIER_SMTP_CONNECTION_URI=smtps://test:test@%s:1025/?skip_ssl_verify=true&legacy_ssl=true",
			state.Containers.MailSlurper.Name),
		fmt.Sprintf("FROM_NAME=%s", state.SettingsFile.MailFromName),
		fmt.Sprintf("FROM_EMAIL=%s", state.SettingsFile.MailFromEmail),
	}
}

// Return Mailslurper services container
func GetMailSlurper(state *State, args *ArgsFlags) containerbuilder.Builder {
	mailslurper := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(MailSlurperImage).
		WithLogWriter(nil).
		WithName(state.Containers.MailSlurper.Name).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithForcePullImage().
		WithNetworks([]string{state.SettingsFile.Network}).
		WithNetworkAliases(state.Containers.MailSlurper.Name).
		WithLabels(map[string]string{
			"com.docker.compose.project":                args.Prefix,
			"com.docker.compose.service":                state.Containers.MailSlurper.Name,
			label.DyrectorioOrg + label.ContainerPrefix: args.Prefix,
		})

	if !args.FullyContainerized {
		mailslurper = mailslurper.
			WithPortBindings([]containerbuilder.PortBinding{
				{
					ExposedPort: defaultMailSlurperSMTPPort,
					PortBinding: pointer.ToUint16(uint16(state.SettingsFile.MailSlurperSMTPPort)),
				},
				{
					ExposedPort: defaultMailSlurperWebPort,
					PortBinding: pointer.ToUint16(uint16(state.SettingsFile.MailSlurperWebPort)),
				},
				{
					ExposedPort: defaultMailSlurperWebPort2,
					PortBinding: pointer.ToUint16(uint16(state.SettingsFile.MailSlurperWebPort2)),
				},
			})
	}
	return mailslurper
}

// Return Postgres services' containers
func GetCruxPostgres(state *State, args *ArgsFlags) containerbuilder.Builder {
	cruxPostgres := GetBasePostgres(state).
		WithName(state.Containers.CruxPostgres.Name).
		WithNetworkAliases(state.Containers.CruxPostgres.Name).
		WithEnv([]string{
			fmt.Sprintf("POSTGRES_USER=%s", state.SettingsFile.CruxPostgresUser),
			fmt.Sprintf("POSTGRES_PASSWORD=%s", state.SettingsFile.CruxPostgresPassword),
			fmt.Sprintf("POSTGRES_DB=%s", state.SettingsFile.CruxPostgresDB),
		}).
		WithLabels(map[string]string{
			"com.docker.compose.project":                args.Prefix,
			"com.docker.compose.service":                state.Containers.CruxPostgres.Name,
			label.DyrectorioOrg + label.ContainerPrefix: args.Prefix,
		})

	if !args.FullyContainerized {
		cruxPostgres = cruxPostgres.
			WithPortBindings([]containerbuilder.PortBinding{
				{
					ExposedPort: defaultPostgresPort,
					PortBinding: pointer.ToUint16(uint16(state.SettingsFile.CruxPostgresPort)),
				},
			}).
			WithMountPoints([]mount.Mount{{
				Type:   mount.TypeVolume,
				Source: fmt.Sprintf("%s-data", state.Containers.CruxPostgres.Name),
				Target: "/var/lib/postgresql/data",
			}})
	}

	return cruxPostgres
}

func GetKratosPostgres(state *State, args *ArgsFlags) containerbuilder.Builder {
	kratosPostgres := GetBasePostgres(state).
		WithEnv([]string{
			fmt.Sprintf("POSTGRES_USER=%s", state.SettingsFile.KratosPostgresUser),
			fmt.Sprintf("POSTGRES_PASSWORD=%s", state.SettingsFile.KratosPostgresPassword),
			fmt.Sprintf("POSTGRES_DB=%s", state.SettingsFile.KratosPostgresDB),
		}).
		WithName(state.Containers.KratosPostgres.Name).
		WithNetworkAliases(state.Containers.KratosPostgres.Name).
		WithLabels(map[string]string{
			"com.docker.compose.project":                args.Prefix,
			"com.docker.compose.service":                state.Containers.KratosPostgres.Name,
			label.DyrectorioOrg + label.ContainerPrefix: args.Prefix,
		})

	if !args.FullyContainerized {
		kratosPostgres = kratosPostgres.
			WithPortBindings([]containerbuilder.PortBinding{
				{
					ExposedPort: defaultPostgresPort,
					PortBinding: pointer.ToUint16(uint16(state.SettingsFile.KratosPostgresPort)),
				},
			}).
			WithMountPoints([]mount.Mount{
				{
					Type:   mount.TypeVolume,
					Source: fmt.Sprintf("%s-data", state.Containers.KratosPostgres.Name),
					Target: "/var/lib/postgresql/data",
				},
			})
	}

	return kratosPostgres
}

// To remove some code duplication
func GetBasePostgres(state *State) containerbuilder.Builder {
	basePostgres := containerbuilder.
		NewDockerBuilder(state.Ctx).
		WithLogWriter(nil).
		WithImage(PostgresImage).
		WithNetworks([]string{state.SettingsFile.Network}).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithForcePullImage().
		WithoutConflict()

	return basePostgres
}

// Copy config file to Traefik Container
func CopyTraefikConfiguration(ctx context.Context, name, internalHostDomain string, cruxPort, cruxUIPort uint) error {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}
	traefikFileProviderTemplate, err := traefikTmpl.ReadFile("traefik.yaml.tmpl")
	if err != nil {
		log.Fatal().Err(err).Stack().Msg("couldn't read embedded file")
	}

	traefikConfig, err := template.New("traefikconfig").Parse(string(traefikFileProviderTemplate))
	if err != nil {
		return err
	}

	var result bytes.Buffer

	traefikData := traefikFileProviderData{
		InternalHost: internalHostDomain,
		CruxUIPort:   cruxUIPort,
		CruxPort:     cruxPort,
	}

	err = traefikConfig.Execute(&result, traefikData)
	if err != nil {
		return err
	}

	data := v1.UploadFileData{
		FilePath: "/etc",
		UID:      0,
		GID:      0,
	}

	err = dagentutils.WriteContainerFile(
		ctx,
		cli,
		name,
		"traefik/dynamic_conf.yml",
		data,
		int64(len([]rune(result.String()))),
		strings.NewReader(result.String()),
	)

	return err
}
