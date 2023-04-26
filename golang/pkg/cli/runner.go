package cli

import (
	"context"
	"embed"
	"fmt"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"

	dockerhelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	"github.com/dyrector-io/dyrectorio/golang/internal/label"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

type StackItemID string

const (
	Traefik        StackItemID = "traefik"
	Crux           StackItemID = "crux"
	CruxUI         StackItemID = "crux-ui"
	Kratos         StackItemID = "kratos"
	CruxPostgres   StackItemID = "crux-postgres"
	KratosPostgres StackItemID = "kratos-postgres"
	MailSlurper    StackItemID = "mailslurper"
)

var StartOrder = []StackItemID{
	Traefik, CruxPostgres, KratosPostgres, Kratos, Crux, MailSlurper, CruxUI,
}

type DyrectorioStack struct {
	Containers *Containers
	builders   map[StackItemID]containerbuilder.Builder
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
	stack := DyrectorioStack{
		Containers: initialState.Containers,
		builders:   map[StackItemID]containerbuilder.Builder{},
	}
	switch args.Command {
	case UpCommand:
		state := SettingsFileDefaults(initialState, args)
		CheckAndUpdatePorts(state, args)
		if args.SettingsWrite {
			SaveSettings(state, args)
		}

		stack.builders[Traefik] = GetTraefik(state, args)
		stack.builders[Kratos] = GetKratos(state, args)
		stack.builders[CruxPostgres] = GetCruxPostgres(state, args)
		stack.builders[KratosPostgres] = GetKratosPostgres(state, args)
		stack.builders[MailSlurper] = GetMailSlurper(state, args)
		if !args.CruxDisabled {
			stack.builders[Crux] = GetCrux(state, args)
		}
		if !args.CruxUIDisabled {
			stack.builders[CruxUI] = GetCruxUI(state, args)
		}

		StartContainers(&stack, state, args)
		PrintInfo(state, args)
	case DownCommand:
		StopContainers(ctx, args)
		log.Info().Msg("Stack is stopped. Hope you had fun! 🎬")
	default:
		log.Fatal().Msg("Invalid command")
	}
}

// Create and Start containers
func StartContainers(stack *DyrectorioStack, state *State, args *ArgsFlags) {
	for _, stackItem := range StartOrder {
		if item, ok := stack.builders[stackItem]; ok {
			cont, err := item.CreateAndStart()
			if err != nil {
				log.Error().Str("container", string(stackItem)).Msg("Failed to start dyrector io stack")
				log.Fatal().Err(err).Stack().Send()
			}
			log.Info().Str("container", cont.GetName()).Msg("Started")
		}
	}
}

// Cleanup for "down" command, prefix can be provided with for multi removal
func StopContainers(ctx context.Context, args *ArgsFlags) {
	var prefixes string

	if args.Prefix != "" {
		prefixes = args.Prefix
	} else {
		prefixes = "dyo-stable"
	}

	for _, prefix := range strings.Split(prefixes, ",") {
		log.Info().Msgf("Removing prefix: %s", prefix)
		err := dockerhelper.DeleteContainersByLabel(ctx, label.GetPrefixLabelFilter(prefix))
		if err != nil {
			log.Error().Err(err).Msg("container delete error")
		}
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
