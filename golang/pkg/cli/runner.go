package cli

import (
	"context"
	"embed"
	"fmt"
	"net"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"

	dockerhelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	"github.com/dyrector-io/dyrectorio/golang/internal/label"
	"github.com/dyrector-io/dyrectorio/golang/internal/runtime/container"
	"github.com/dyrector-io/dyrectorio/golang/internal/version"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

type stackItemID string

const (
	traefik        stackItemID = "traefik"
	crux           stackItemID = "crux"
	cruxUI         stackItemID = "crux-ui"
	kratos         stackItemID = "kratos"
	cruxPostgres   stackItemID = "crux-postgres"
	kratosPostgres stackItemID = "kratos-postgres"
	mailSlurper    stackItemID = "mailslurper"
)

var startOrder = []stackItemID{
	cruxPostgres, kratosPostgres, kratos, crux, mailSlurper, cruxUI, traefik,
}

type dyrectorioStack struct {
	Containers *Containers
	builders   map[stackItemID]containerbuilder.Builder
}

const (
	containerNetDriver = "bridge"
)

// commands
const (
	UpCommand      = "up"
	DownCommand    = "down"
	VersionCommand = "version"
)

type traefikFileProviderData struct {
	InternalHost string
	HostRules    string
	CruxUIPort   uint
	CruxPort     uint
}

//go:embed traefik.yaml.tmpl
var traefikTmpl embed.FS

// ProcessCommand is the main control function
func ProcessCommand(ctx context.Context, initialState *State, args *ArgsFlags) {
	stack := dyrectorioStack{
		Containers: initialState.Containers,
		builders:   map[stackItemID]containerbuilder.Builder{},
	}

	switch args.Command {
	case UpCommand:
		state := SettingsFileDefaults(initialState, args)

		CheckSettings(state, args)
		checkForBoundPorts(state, args)

		stack.builders[traefik] = GetTraefik(state, args)
		stack.builders[kratos] = GetKratos(state, args)
		stack.builders[cruxPostgres] = GetCruxPostgres(state, args)
		stack.builders[kratosPostgres] = GetKratosPostgres(state, args)
		stack.builders[mailSlurper] = GetMailSlurper(state, args)
		if !args.CruxDisabled {
			stack.builders[crux] = GetCrux(state, args)
		}
		if !args.CruxUIDisabled {
			stack.builders[cruxUI] = GetCruxUI(state, args)
		}

		StartContainers(&stack)
		PrintInfo(state, args)
	case DownCommand:
		StopContainers(ctx, args)
		log.Info().Msg("Stack is stopped. Hope you had fun! 🎬")
	case VersionCommand:
		cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
		if err != nil {
			log.Fatal().Err(err).Msg("Could not connect to docker socket.")
		}
		out, err := container.VersionCheck(ctx, cli)
		if err != nil {
			log.Fatal().Err(err).Msg("Version error")
		}
		out.Str("CLI version", version.Version)
		out.Msg("")
	default:
		log.Fatal().Msg("Invalid command")
	}
}

// StartContainers is for creating and starting containers
func StartContainers(stack *dyrectorioStack) {
	for _, stackItem := range startOrder {
		if item, ok := stack.builders[stackItem]; ok {
			cont, err := item.CreateAndStart()
			if err != nil {
				log.Error().Str("container", string(stackItem)).Msg("Failed to start dyrector.io stack")
				log.Fatal().Err(err).Stack().Send()
			}

			log.Info().Str("container", cont.GetName()).Msg("Started")
		}
	}
}

// StopContainers is a cleanup for "down" command, prefix can be provided with for multi removal
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
			log.Fatal().Err(err).Msg("container delete error")
		}
	}
}

// EnsureNetworkExists makes sure the container network exists
func EnsureNetworkExists(state *State) {
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
			Driver: containerNetDriver,
		}

		resp, err := cli.NetworkCreate(context.Background(), state.SettingsFile.Network, opts)
		log.Info().Str("id", resp.ID).Msg("Network created")
		if err != nil {
			log.Fatal().Err(err).Stack().Send()
		}
		return
	}

	for i := range networks {
		if networks[i].Driver != containerNetDriver {
			log.Fatal().
				Str("network", state.SettingsFile.Network).
				Str("driver", containerNetDriver).
				Msg("network exists, but doesn't have the correct driver")
		} else {
			return
		}
	}

	log.Fatal().Msg("unknown network error")
}

func checkForBoundPorts(state *State, args *ArgsFlags) {
	hasUnavailablePort := false

	portServiceMap := map[uint]string{
		state.SettingsFile.CruxPostgresPort:   "crux's Postgres",
		state.SettingsFile.KratosPostgresPort: "kratos' Postgres",
		state.SettingsFile.KratosPublicPort:   "kratos public",
		state.SettingsFile.KratosAdminPort:    "kratos admin",
		state.SettingsFile.MailSlurperUIPort:  "mailslurper SMTP",
		state.SettingsFile.MailSlurperUIPort:  "mailslurper UI",
		state.SettingsFile.MailSlurperAPIPort: "mailslurper API",
		state.SettingsFile.TraefikWebPort:     "traefik proxy",
		state.SettingsFile.TraefikUIPort:      "traefik dashboard",
	}

	if !args.CruxDisabled {
		portServiceMap[state.SettingsFile.CruxHTTPPort] = "crux HTTP"
		portServiceMap[state.SettingsFile.CruxAgentGrpcPort] = "crux gRPC"
	}

	if !args.CruxUIDisabled {
		portServiceMap[state.SettingsFile.CruxUIPort] = "crux-ui HTTP"
	}

	for portNum, service := range portServiceMap {
		err := checkPort(portNum, service)
		if err != nil {
			hasUnavailablePort = true
		}
	}

	if hasUnavailablePort {
		log.Fatal().Msg(fmt.Sprintf("There's at least one port that is not available. See the configuration %s file for "+
			"the necessary settings. Please change the ports of the mentioned services or make sure the necessary ports "+
			"are available for use.", args.SettingsFilePath))
	}
}

func checkPort(portNum uint, servicePort string) error {
	ln, err := net.Listen("tcp", fmt.Sprintf(":%d", portNum))
	if err != nil {
		log.Error().Str("service", servicePort).Uint("port", portNum).Msg("Couldn't bind to port for the service")
		return fmt.Errorf("can`t bind, %w", err)
	}

	err = ln.Close()
	if err != nil {
		log.Error().Str("service", servicePort).Uint("port", portNum).Msg("Couldn't close the port for the service")
		return fmt.Errorf("can`t close, %w", err)
	}
	return nil
}
