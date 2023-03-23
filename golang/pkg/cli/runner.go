package cli

import (
	"bytes"
	"context"
	"embed"
	"fmt"
	"strings"
	"text/template"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/label"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	dagentutils "github.com/dyrector-io/dyrectorio/golang/pkg/dagent/utils"
	dockerhelper "github.com/dyrector-io/dyrectorio/golang/pkg/helper/docker"
)

type DyrectorioStack struct {
	Containers     *Containers
	Traefik        *containerbuilder.DockerContainerBuilder
	Crux           *containerbuilder.DockerContainerBuilder
	CruxMigrate    *containerbuilder.DockerContainerBuilder
	CruxUI         *containerbuilder.DockerContainerBuilder
	Kratos         *containerbuilder.DockerContainerBuilder
	KratosMigrate  *containerbuilder.DockerContainerBuilder
	CruxPostgres   *containerbuilder.DockerContainerBuilder
	KratosPostgres *containerbuilder.DockerContainerBuilder
	MailSlurper    *containerbuilder.DockerContainerBuilder
}

const (
	ContainerNetDriver = "bridge"
)

const (
	UpCommand   = "up"
	DownCommand = "down"
)

type traefikFileProviderData struct {
	InternalHost string
	CruxUIPort   uint
	CruxPort     uint
}

//go:embed traefik.yaml.tmpl
var traefikTmpl embed.FS

func ProcessCommand(ctx context.Context, initialState *State, args *ArgsFlags) {
	builders := DyrectorioStack{
		Containers: initialState.Containers,
	}
	switch args.Command {
	case UpCommand:
		state := SettingsFileDefaults(initialState, args)
		CheckAndUpdatePorts(state, args)
		if args.SettingsWrite {
			SaveSettings(state, args)
		}

		builders.Traefik = GetTraefik(state, args)
		builders.Crux = GetCrux(state, args)
		builders.CruxMigrate = GetCruxMigrate(state, args)
		builders.CruxUI = GetCruxUI(state, args)
		builders.Kratos = GetKratos(state, args)
		builders.KratosMigrate = GetKratosMigrate(state, args)
		builders.CruxPostgres = GetCruxPostgres(state, args)
		builders.KratosPostgres = GetKratosPostgres(state, args)
		builders.MailSlurper = GetMailSlurper(state, args)

		StartContainers(&builders, state, args)
		PrintInfo(state, args)
	case DownCommand:
		StopContainers(ctx, args)
		log.Info().Msg("Stack is stopped. Hope you had fun! 🎬")
	default:
		log.Fatal().Msg("invalid command")
	}
}

// Create and Start containers
func StartContainers(containers *DyrectorioStack, state *State, args *ArgsFlags) {
	traefik, err := containers.Traefik.Create()
	if err != nil {
		log.Fatal().Err(err).Stack().Send()
	}

	TraefikConfiguration(
		containers.Containers.Traefik.Name,
		state.InternalHostDomain,
		state.SettingsFile.CruxHTTPPort,
		state.SettingsFile.CruxUIPort,
	)

	err = traefik.Start()
	if err != nil {
		log.Fatal().Err(err).Stack().Send()
	}
	log.Info().Str("container", containers.Containers.Traefik.Name).Msg("started:")

	err = containers.CruxPostgres.CreateAndStart()
	if err != nil {
		log.Fatal().Err(err).Stack().Send()
	}
	log.Info().Str("container", containers.Containers.CruxPostgres.Name).Msg("started:")

	err = containers.KratosPostgres.CreateAndStart()
	if err != nil {
		log.Fatal().Err(err).Stack().Send()
	}
	log.Info().Str("container", containers.Containers.KratosPostgres.Name).Msg("started:")

	log.Info().Str("container", containers.Containers.KratosMigrate.Name).Msg("migration started:")
	_, err = containers.KratosMigrate.CreateAndWaitUntilExit()
	if err != nil {
		log.Fatal().Err(err).Stack().Send()
	}
	log.Info().Str("container", containers.Containers.KratosMigrate.Name).Msg("migration done:")

	err = containers.Kratos.CreateAndStart()
	if err != nil {
		log.Fatal().Err(err).Stack().Send()
	}
	log.Info().Str("container", containers.Containers.Kratos.Name).Msg("started:")

	if !containers.Containers.Crux.Disabled {
		log.Info().Str("container", containers.Containers.CruxMigrate.Name).Msg("migration started:")
		_, err = containers.CruxMigrate.CreateAndWaitUntilExit()
		if err != nil {
			log.Fatal().Err(err).Stack().Send()
		}
		log.Info().Str("container", containers.Containers.CruxMigrate.Name).Msg("migration done:")

		err = containers.Crux.CreateAndStart()
		if err != nil {
			log.Fatal().Err(err).Stack().Send()
		}
		log.Info().Str("container", containers.Containers.Crux.Name).Msg("started:")
	}

	if !containers.Containers.CruxUI.Disabled {
		err = containers.CruxUI.CreateAndStart()
		if err != nil {
			log.Fatal().Err(err).Stack().Send()
		}
		log.Info().Str("container", containers.Containers.CruxUI.Name).Msg("started:")
	}

	err = containers.MailSlurper.CreateAndStart()
	if err != nil {
		log.Fatal().Err(err).Stack().Send()
	}
	log.Info().Str("container", containers.Containers.MailSlurper.Name).Msg("started:")
}

// Cleanup for "down" command, prefix can be provided with for multi removal
func StopContainers(ctx context.Context, args *ArgsFlags) {
	var prefixes string

	if args.Prefix != "" {
		prefixes = args.Prefix
	} else {
		prefixes = util.JoinV(",", "dyo-stable", "dyo-latest")
	}

	for _, prefix := range strings.Split(prefixes, ",") {
		log.Info().Msgf("Removing prefix: %s", prefix)
		err := dockerhelper.DeleteContainersByLabel(ctx, label.GetPrefixLabelFilter(prefix))
		if err != nil {
			log.Debug().Err(err).Send()
		}
	}
}

// Copy to Traefik Container
func TraefikConfiguration(name, internalHostDomain string, cruxPort, cruxUIPort uint) {
	const funct = "TraefikConfiguration"
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Err(err).Stack().Msg(funct)
	}

	traefikFileProviderTemplate, err := traefikTmpl.ReadFile("traefik.yaml.tmpl")
	if err != nil {
		log.Fatal().Err(err).Stack().Msg("couldn't read embedded file")
	}

	traefikConfig, err := template.New("traefikconfig").Parse(string(traefikFileProviderTemplate))
	if err != nil {
		log.Fatal().Err(err).Stack().Msg(funct)
	}

	var result bytes.Buffer

	traefikData := traefikFileProviderData{
		InternalHost: internalHostDomain,
		CruxUIPort:   cruxUIPort,
		CruxPort:     cruxPort,
	}

	err = traefikConfig.Execute(&result, traefikData)
	if err != nil {
		log.Fatal().Err(err).Stack().Msg(funct)
	}

	data := v1.UploadFileData{
		FilePath: "/etc",
		UID:      0,
		GID:      0,
	}

	err = dagentutils.WriteContainerFile(
		context.Background(),
		cli,
		name,
		"traefik/dynamic_conf.yml",
		data,
		int64(len([]rune(result.String()))),
		strings.NewReader(result.String()),
	)

	if err != nil {
		log.Fatal().Err(err).Stack().Msg(funct)
	}
}

func EnsureNetworkExists(state *State, args *ArgsFlags) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Err(err).Stack().Send()
	}

	filter := filters.NewArgs()
	filter.Add("name", fmt.Sprintf("^%s$", state.SettingsFile.Network))

	networks, err := cli.NetworkList(context.Background(),
		types.NetworkListOptions{
			Filters: filter,
		})
	if err != nil {
		log.Fatal().Err(err).Stack().Send()
	}

	if len(networks) == 0 {
		opts := types.NetworkCreate{
			Driver: ContainerNetDriver,
		}

		resp, err := cli.NetworkCreate(context.Background(), state.SettingsFile.Network, opts)
		log.Info().Str("responseId", resp.ID).Msg("Network created with ")
		if err != nil {
			log.Fatal().Err(err).Stack().Send()
		}
		return
	}

	for i := range networks {
		if networks[i].Driver != ContainerNetDriver {
			log.Fatal().
				Str("network", state.SettingsFile.Network).
				Str("driver", ContainerNetDriver).
				Msg("network exists, but doesn't have the correct driver")
		} else {
			return
		}
	}

	log.Fatal().Msg("unknown network error")
}
