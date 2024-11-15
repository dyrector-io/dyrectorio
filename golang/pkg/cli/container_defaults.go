package cli

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"
	"text/template"
	"time"

	"github.com/AlekSi/pointer"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	"github.com/dyrector-io/dyrectorio/golang/internal/label"
	"github.com/dyrector-io/dyrectorio/golang/internal/logdefer"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	dagentutils "github.com/dyrector-io/dyrectorio/golang/pkg/dagent/utils"
)

const (
	postgresImage    = "docker.io/library/postgres:13-alpine"
	mailSlurperImage = "docker.io/oryd/mailslurper:smtps-latest"
)

const (
	defaultCruxAgentGrpcPort   = 5000
	defaultCruxHTTPPort        = 1848
	defaultCruxUIPort          = 3000
	defaultTraefikInternalPort = 8000
	defaultTraefikUIPort       = 8080
	defaultKratosPublicPort    = 4433
	defaultKratosAdminPort     = 4434
	defaultMailSlurperSMTPPort = 1025
	defaultMailSlurperUIPort   = 4436
	defaultMailSlurperAPIPort  = 4437
	defaultPostgresPort        = 5432
	healhProbeTimeout          = 2 * time.Minute
	healhProbeInterval         = time.Second
)

func baseContainer(ctx context.Context, args *ArgsFlags) containerbuilder.Builder {
	builder := containerbuilder.NewDockerBuilder(ctx).
		WithPullDisplayFunc(DockerPullProgressDisplayer).
		WithLogWriter(nil).
		WithoutConflict()
	if args.PreferLocalImages {
		builder.WithImagePriority(image.PreferLocal)
	}
	return builder
}

// GetCrux services: db migrations and crux api service
func GetCrux(state *State, args *ArgsFlags) containerbuilder.Builder {
	crux := baseContainer(state.Ctx, args).
		WithImage(fmt.Sprintf("%s:%s", state.Crux.Image, state.SettingsFile.Version)).
		WithName(state.Containers.Crux.Name).
		WithRestartPolicy(container.RestartPolicyAlways).
		WithEnv(getCruxEnvs(state, args)).
		WithNetworks([]string{state.SettingsFile.Network}).
		WithNetworkAliases(state.Containers.Crux.Name).
		WithCmd([]string{"serve"}).
		WithLabels(map[string]string{
			"traefik.enable": "true",
			"traefik.http.routers.crux.rule": fmt.Sprintf("(%s) && "+
				"PathPrefix(`/api`) && !PathPrefix(`/api/auth`) && !PathPrefix(`/api/status`) ",
				RenderTraefikHostRules(append(args.Hosts, state.Containers.Traefik.Name, state.InternalHostDomain)...)),
			"traefik.http.routers.crux.entrypoints":               "web",
			"traefik.http.services.crux.loadbalancer.server.port": fmt.Sprintf("%d", defaultCruxHTTPPort),
			"com.docker.compose.project":                          args.Prefix,
			"com.docker.compose.service":                          state.Containers.Crux.Name,
			label.DyrectorioOrg + label.ContainerPrefix:           args.Prefix,
			label.DyrectorioOrg + label.ServiceCategory:           label.GetHiddenServiceCategory("internal"),
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

	return crux
}

func getCruxInitContainer(state *State, args *ArgsFlags) containerbuilder.LifecycleFunc {
	envs := append([]string{
		fmt.Sprintf("TZ=%s", state.SettingsFile.TimeZone),
		fmt.Sprintf("DATABASE_URL=postgresql://%s:%s@%s:%d/%s?schema=public",
			state.SettingsFile.CruxPostgresUser,
			state.SettingsFile.CruxPostgresPassword,
			state.Containers.CruxPostgres.Name,
			defaultPostgresPort,
			state.SettingsFile.CruxPostgresDB),
		fmt.Sprintf("ENCRYPTION_SECRET_KEY=%s", state.SettingsFile.CruxEncryptionKey),
	}, state.EnvFile...)

	return func(ctx context.Context, _ client.APIClient,
		_ containerbuilder.ParentContainer,
	) error {
		cruxMigrate := baseContainer(ctx, args).
			WithImage(fmt.Sprintf("%s:%s", state.Crux.Image, state.SettingsFile.Version)).
			WithName(state.Containers.CruxMigrate.Name).
			WithEnv(envs).
			WithNetworks([]string{state.SettingsFile.Network}).
			WithNetworkAliases(state.Containers.CruxMigrate.Name).
			WithCmd([]string{"migrate"}).
			WithLabels(map[string]string{
				"com.docker.compose.project":                args.Prefix,
				"com.docker.compose.service":                state.Containers.CruxMigrate.Name,
				label.DyrectorioOrg + label.ContainerPrefix: args.Prefix,
				label.DyrectorioOrg + label.ServiceCategory: label.GetHiddenServiceCategory("internal"),
			})

		cont, res, err := cruxMigrate.CreateAndStartWaitUntilExit()
		if err != nil {
			return errors.Join(err, fmt.Errorf("container %s exited with code: %d", cont.GetName(), res.StatusCode))
		}
		log.Info().Str("initContainer", cont.GetName()).Msgf("Started")
		return nil
	}
}

func getCruxEnvs(state *State, args *ArgsFlags) []string {
	envs := []string{}
	host := localhost
	traefikHost := localhost
	if args.FullyContainerized {
		host = state.Containers.Crux.Name
		traefikHost = state.Containers.Traefik.Name
	}

	// this is a pipeline configuration
	if !args.CruxDisabled && args.FullyContainerized {
		envs = append(envs,
			fmt.Sprintf("CRUX_AGENT_IMAGE=%s", "latest"),
		)
	}

	cruxAgentAddr := fmt.Sprintf("%s:%d", state.Containers.Crux.Name, defaultCruxAgentGrpcPort)
	if args.LocalAgent {
		cruxAgentAddr = fmt.Sprintf("%s:%d", host, state.SettingsFile.CruxAgentGrpcPort)
	}
	envs = append(envs,
		fmt.Sprintf("TZ=%s", state.SettingsFile.TimeZone),
		fmt.Sprintf("NODE_ENV=%s", "development"),
		fmt.Sprintf("LOG_LEVEL=%s", "debug"),
		fmt.Sprintf("DATABASE_URL=postgresql://%s:%s@%s:%d/%s?schema=public",
			state.SettingsFile.CruxPostgresUser,
			state.SettingsFile.CruxPostgresPassword,
			state.Containers.CruxPostgres.Name,
			defaultPostgresPort,
			state.SettingsFile.CruxPostgresDB),
		fmt.Sprintf("KRATOS_URL=http://%s:%d/kratos",
			state.Containers.Traefik.Name,
			defaultTraefikInternalPort),
		fmt.Sprintf("KRATOS_ADMIN_URL=http://%s:%d",
			state.Containers.Kratos.Name,
			state.SettingsFile.KratosAdminPort),
		fmt.Sprintf("CRUX_UI_URL=http://%s:%d", traefikHost, state.SettingsFile.TraefikWebPort),
		fmt.Sprintf("CRUX_AGENT_ADDRESS=%s", cruxAgentAddr),
		"LOCAL_DEPLOYMENT=true",
		fmt.Sprintf("LOCAL_DEPLOYMENT_NETWORK=%s", state.SettingsFile.Network),
		fmt.Sprintf("JWT_SECRET=%s", state.SettingsFile.CruxSecret),
		fmt.Sprintf("FROM_NAME=%s", state.SettingsFile.MailFromName),
		fmt.Sprintf("FROM_EMAIL=%s", state.SettingsFile.MailFromEmail),
		fmt.Sprintf("SMTP_URI=%s:1025/?skip_ssl_verify=true&legacy_ssl=true", state.Containers.MailSlurper.Name),
		fmt.Sprintf("AGENT_INSTALL_SCRIPT_DISABLE_PULL=%t", true),
		fmt.Sprintf("ENCRYPTION_SECRET_KEY=%s", state.SettingsFile.CruxEncryptionKey),
		"DISABLE_RECAPTCHA=true",
		"QA_OPT_OUT=true",
	)
	return append(envs, state.EnvFile...)
}

// GetCruxUI returns a configured crux-ui service
func GetCruxUI(state *State, args *ArgsFlags) containerbuilder.Builder {
	traefikHost := localhost
	if args.FullyContainerized {
		traefikHost = state.Containers.Traefik.Name
	}

	envs := append([]string{
		fmt.Sprintf("TZ=%s", state.SettingsFile.TimeZone),
		fmt.Sprintf("CRUX_UI_URL=http://%s:%d", traefikHost, state.SettingsFile.TraefikWebPort),
		fmt.Sprintf("CRUX_URL=http://%s:%d",
			state.Containers.Traefik.Name,
			defaultTraefikInternalPort),
		fmt.Sprintf("KRATOS_URL=http://%s:%d/kratos",
			state.Containers.Traefik.Name,
			defaultTraefikInternalPort),
		fmt.Sprintf("KRATOS_ADMIN_URL=http://%s:%d",
			state.Containers.Kratos.Name,
			state.SettingsFile.KratosAdminPort),
		"DISABLE_RECAPTCHA=true",
	}, state.EnvFile...)

	cruxUI := baseContainer(state.Ctx, args).
		WithImage(fmt.Sprintf("%s:%s", state.CruxUI.Image, state.SettingsFile.Version)).
		WithName(state.Containers.CruxUI.Name).
		WithRestartPolicy(container.RestartPolicyAlways).
		WithEnv(envs).
		WithNetworks([]string{state.SettingsFile.Network}).
		WithNetworkAliases(state.Containers.CruxUI.Name).
		WithLabels(map[string]string{
			"traefik.enable": "true",
			"traefik.http.routers.crux-ui.rule": RenderTraefikHostRules(
				append(args.Hosts, traefikHost, state.InternalHostDomain, state.Containers.Traefik.Name)...),
			"traefik.http.routers.crux-ui.entrypoints":               "web",
			"traefik.http.services.crux-ui.loadbalancer.server.port": fmt.Sprintf("%d", defaultCruxUIPort),
			"com.docker.compose.project":                             args.Prefix,
			"com.docker.compose.service":                             state.Containers.CruxUI.Name,
			label.DyrectorioOrg + label.ContainerPrefix:              args.Prefix,
			label.DyrectorioOrg + label.ServiceCategory:              label.GetHiddenServiceCategory("internal"),
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

	return cruxUI
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
		"--log.level=DEBUG",
		"--accesslog=true",
		"--api.insecure=true",
		"--providers.docker=true",
		"--providers.docker.exposedbydefault=false",
		fmt.Sprintf("--entrypoints.web.address=:%d", defaultTraefikInternalPort),
	}

	if args.CruxUIDisabled {
		commands = append(commands, "--providers.file.directory=/etc/traefik", "--providers.file.watch=true")
	}

	mountType := mount.TypeBind
	if state.SettingsFile.TraefikIsDockerSocketNamedPipe {
		mountType = mount.TypeNamedPipe
	}

	traefik := baseContainer(state.Ctx, args).
		WithImage("docker.io/library/traefik:v2.9").
		WithName(state.Containers.Traefik.Name).
		WithRestartPolicy(container.RestartPolicyAlways).
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
			label.DyrectorioOrg + label.ServiceCategory: label.GetHiddenServiceCategory("internal"),
		}).
		WithPostStartHooks(func(ctx context.Context, _ client.APIClient,
			cont containerbuilder.ParentContainer,
		) error {
			return CopyTraefikConfiguration(
				ctx,
				cont.Name,
				state.InternalHostDomain,
				args.Hosts,
				state.SettingsFile.CruxHTTPPort,
				state.SettingsFile.CruxUIPort,
			)
		})

	if args.FullyContainerized {
		traefikHost := state.Containers.Traefik.Name
		traefik.
			WithPostStartHooks(func(ctx context.Context, _ client.APIClient,
				_ containerbuilder.ParentContainer,
			) error {
				addr := fmt.Sprintf("http://%s:%d/api/status", traefikHost, state.SettingsFile.TraefikWebPort)
				return healthProbe(ctx, addr)
			})
	} else {
		traefik = traefik.
			WithPortBindings([]containerbuilder.PortBinding{
				{
					ExposedPort: defaultTraefikInternalPort,
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

// GetKratos returns Kratos services' containers
func GetKratos(state *State, args *ArgsFlags) containerbuilder.Builder {
	kratos := baseContainer(state.Ctx, args).
		WithImage(fmt.Sprintf("%s:%s", state.Kratos.Image, state.SettingsFile.Version)).
		WithName(state.Containers.Kratos.Name).
		WithRestartPolicy(container.RestartPolicyAlways).
		WithEnv(getKratosEnvs(state)).
		WithNetworks([]string{state.SettingsFile.Network}).
		WithNetworkAliases(state.Containers.Kratos.Name).
		WithLabels(map[string]string{
			"traefik.enable": "true",
			"traefik.http.routers.kratos.rule": fmt.Sprintf("(%s) && "+
				"PathPrefix(`/kratos`)",
				RenderTraefikHostRules(append(args.Hosts, state.Containers.Traefik.Name, state.InternalHostDomain)...)),
			"traefik.http.routers.kratos.entrypoints":                    "web",
			"traefik.http.services.kratos.loadbalancer.server.port":      fmt.Sprintf("%d", defaultKratosPublicPort),
			"traefik.http.middlewares.kratos-strip.stripprefix.prefixes": "/kratos",
			"traefik.http.routers.kratos.middlewares":                    "kratos-strip",
			"com.docker.compose.project":                                 args.Prefix,
			"com.docker.compose.service":                                 state.Containers.Kratos.Name,
			label.DyrectorioOrg + label.ContainerPrefix:                  args.Prefix,
			label.DyrectorioOrg + label.ServiceCategory:                  label.GetHiddenServiceCategory("internal"),
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

	return kratos
}

func getKratosInitContainer(state *State, args *ArgsFlags) containerbuilder.LifecycleFunc {
	envs := append([]string{
		"SQA_OPT_OUT=true",
		fmt.Sprintf("DSN=postgresql://%s:%s@%s:%d/%s?sslmode=disable&max_conns=20&max_idle_conns=4",
			state.SettingsFile.KratosPostgresUser,
			state.SettingsFile.KratosPostgresPassword,
			state.Containers.KratosPostgres.Name,
			defaultPostgresPort,
			state.SettingsFile.KratosPostgresDB),
	}, state.EnvFile...)

	return func(_ context.Context, _ client.APIClient, _ containerbuilder.ParentContainer) error {
		kratosMigrate := baseContainer(state.Ctx, args).
			WithImage(fmt.Sprintf("%s:%s", state.Kratos.Image, state.SettingsFile.Version)).
			WithName(state.Containers.KratosMigrate.Name).
			WithEnv(envs).
			WithNetworks([]string{state.SettingsFile.Network}).
			WithNetworkAliases(state.Containers.KratosMigrate.Name).
			WithCmd([]string{"-c /etc/config/kratos/kratos.yaml", "migrate", "sql", "-e", "--yes"}).
			WithLabels(map[string]string{
				"com.docker.compose.project":                args.Prefix,
				"com.docker.compose.service":                state.Containers.KratosMigrate.Name,
				label.DyrectorioOrg + label.ContainerPrefix: args.Prefix,
				label.DyrectorioOrg + label.ServiceCategory: label.GetHiddenServiceCategory("internal"),
			})

		cont, res, err := kratosMigrate.CreateAndStartWaitUntilExit()
		if err != nil {
			return errors.Join(err, fmt.Errorf("container %s exited with code: %d", cont.GetName(), res.StatusCode))
		}
		log.Info().Str("initContainer", cont.GetName()).Msgf("Started")
		return nil
	}
}

// getKratosEnvs returns kratos service's environmental variables
func getKratosEnvs(state *State) []string {
	traefikHost := localhost

	envs := []string{
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

	return append(envs, state.EnvFile...)
}

// GetMailSlurper returns the mailslurper service's container
func GetMailSlurper(state *State, args *ArgsFlags) containerbuilder.Builder {
	mailslurper := baseContainer(state.Ctx, args).
		WithImage(mailSlurperImage).
		WithName(state.Containers.MailSlurper.Name).
		WithRestartPolicy(container.RestartPolicyAlways).
		WithNetworks([]string{state.SettingsFile.Network}).
		WithNetworkAliases(state.Containers.MailSlurper.Name).
		WithLabels(map[string]string{
			"com.docker.compose.project":                args.Prefix,
			"com.docker.compose.service":                state.Containers.MailSlurper.Name,
			label.DyrectorioOrg + label.ContainerPrefix: args.Prefix,
			label.DyrectorioOrg + label.ServiceCategory: label.GetHiddenServiceCategory("internal"),
		})

	if !args.FullyContainerized {
		mailslurper = mailslurper.
			WithPortBindings([]containerbuilder.PortBinding{
				{
					ExposedPort: defaultMailSlurperSMTPPort,
					PortBinding: pointer.ToUint16(uint16(state.SettingsFile.MailSlurperSMTPPort)),
				},
				{
					ExposedPort: defaultMailSlurperUIPort,
					PortBinding: pointer.ToUint16(uint16(state.SettingsFile.MailSlurperUIPort)),
				},
				{
					ExposedPort: defaultMailSlurperAPIPort,
					PortBinding: pointer.ToUint16(uint16(state.SettingsFile.MailSlurperAPIPort)),
				},
			})
	}
	return mailslurper
}

// GetCruxPostgres returns crux's Postgres services' containers
func GetCruxPostgres(state *State, args *ArgsFlags) containerbuilder.Builder {
	envs := append([]string{
		fmt.Sprintf("POSTGRES_USER=%s", state.SettingsFile.CruxPostgresUser),
		fmt.Sprintf("POSTGRES_PASSWORD=%s", state.SettingsFile.CruxPostgresPassword),
		fmt.Sprintf("POSTGRES_DB=%s", state.SettingsFile.CruxPostgresDB),
	}, state.EnvFile...)

	cruxPostgres := getBasePostgres(state, args).
		WithName(state.Containers.CruxPostgres.Name).
		WithNetworkAliases(state.Containers.CruxPostgres.Name).
		WithEnv(envs).
		WithLabels(map[string]string{
			"com.docker.compose.project":                args.Prefix,
			"com.docker.compose.service":                state.Containers.CruxPostgres.Name,
			label.DyrectorioOrg + label.ContainerPrefix: args.Prefix,
			label.DyrectorioOrg + label.ServiceCategory: label.GetHiddenServiceCategory("internal"),
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

// GetKratosPostgres returns crux's Postgres services' containers
func GetKratosPostgres(state *State, args *ArgsFlags) containerbuilder.Builder {
	envs := append([]string{
		fmt.Sprintf("POSTGRES_USER=%s", state.SettingsFile.KratosPostgresUser),
		fmt.Sprintf("POSTGRES_PASSWORD=%s", state.SettingsFile.KratosPostgresPassword),
		fmt.Sprintf("POSTGRES_DB=%s", state.SettingsFile.KratosPostgresDB),
	}, state.EnvFile...)

	kratosPostgres := getBasePostgres(state, args).
		WithEnv(envs).
		WithName(state.Containers.KratosPostgres.Name).
		WithNetworkAliases(state.Containers.KratosPostgres.Name).
		WithLabels(map[string]string{
			"com.docker.compose.project":                args.Prefix,
			"com.docker.compose.service":                state.Containers.KratosPostgres.Name,
			label.DyrectorioOrg + label.ContainerPrefix: args.Prefix,
			label.DyrectorioOrg + label.ServiceCategory: label.GetHiddenServiceCategory("internal"),
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

// getBasePostgres removes some code duplication
func getBasePostgres(state *State, args *ArgsFlags) containerbuilder.Builder {
	basePostgres := baseContainer(state.Ctx, args).
		WithImage(postgresImage).
		WithNetworks([]string{state.SettingsFile.Network}).
		WithRestartPolicy(container.RestartPolicyAlways)
	return basePostgres
}

// CopyTraefikConfiguration copies a config file to Traefik Container
func CopyTraefikConfiguration(ctx context.Context, name, internalHost string, hosts []string, cruxPort, cruxUIPort uint) error {
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
		HostRules:    RenderTraefikHostRules(append(hosts, internalHost)...),
		InternalHost: internalHost,
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

func healthProbe(ctx context.Context, address string) error {
	ctx, cancel := context.WithTimeout(ctx, healhProbeTimeout)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, address, http.NoBody)
	if err != nil {
		return fmt.Errorf("failed to create the http request for healh probe: %s", err.Error())
	}

	log.Info().Str("address", address).Msg("Health probing")

	ticker := time.NewTicker(healhProbeInterval)
	lastStatusCode := -1

	for {
		select {
		case <-ticker.C:
			//nolint:bodyclose //closed already
			resp, reqErr := http.DefaultClient.Do(req)
			err = reqErr
			if reqErr != nil {
				continue
			}

			logdefer.LogDeferredErr(resp.Body.Close, log.Debug(), "failed to close the response body while health probing")

			if resp.StatusCode == http.StatusOK {
				return nil
			}

			lastStatusCode = resp.StatusCode
		case <-ctx.Done():
			if err != nil {
				return fmt.Errorf("failed to execute request for %s health probe: %s", address, err.Error())
			}

			return fmt.Errorf("health probe timeout for %s, last status code: %d", address, lastStatusCode)
		}
	}
}

func RenderTraefikHostRules(hosts ...string) string {
	hostRules := []string{}
	for _, v := range hosts {
		hostRules = append(hostRules, fmt.Sprintf("Host(`%s`)", v))
	}

	return util.JoinV(" || ", hostRules...)
}
