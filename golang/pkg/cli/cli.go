// Package cli is the package behind dyo command line executable
package cli

import (
	"context"

	"github.com/rs/zerolog"
	ucli "github.com/urfave/cli/v2"

	"github.com/dyrector-io/dyrectorio/golang/internal/version"
)

// flags
const (
	FlagDisableCrux        = "disable-crux"
	FlagDisableCruxUI      = "disable-crux-ui"
	FlagLocalAgent         = "local-agent"
	FlagWrite              = "write"
	FlagDebug              = "debug"
	FlagPreferLocalImages  = "prefer-local-images"
	FlagConfigPath         = "config"
	FlagHosts              = "host"
	FlagPrefix             = "prefix"
	FlagImageTag           = "image-tag"
	FlagSilent             = "silent"
	FlagExpectContainerEnv = "expect-container-env"
	FlagNetwork            = "network"
	FlagEnvFile            = "env-file"
)

// InitCLI returns the configuration flags of the program
//
//nolint:funlen
func InitCLI() *ucli.App {
	return &ucli.App{
		Name:     "dyo",
		Version:  version.BuildVersion(),
		HelpName: "dyo",
		Usage:    "cli tool for deploying a complete dyrector.io stack locally, for demonstration, testing, or development purposes",

		Commands: []*ucli.Command{
			{
				Name:    UpCommand,
				Aliases: []string{"u"},
				Usage:   "Run the stack",
				Action:  run,
			},
			{
				Name:    DownCommand,
				Aliases: []string{"d"},
				Usage:   "Stop the stack",
				Action:  run,
			},
			{
				Name:    VersionCommand,
				Aliases: []string{"v"},
				Action:  run,
			},
			GetGenerateCommand(),
		},
		Flags: []ucli.Flag{
			&ucli.BoolFlag{
				Name:     FlagDisableCrux,
				Aliases:  []string{"dc"},
				Value:    false,
				Usage:    "disable crux(backend) service",
				Required: false,
				EnvVars:  []string{"DISABLE_CRUX"},
			},
			&ucli.BoolFlag{
				Name:     FlagDisableCruxUI,
				Aliases:  []string{"dcu"},
				Value:    false,
				Usage:    "disable crux-ui(frontend) service",
				Required: false,
				EnvVars:  []string{"DISABLE_CRUXUI"},
			},
			&ucli.BoolFlag{
				Name:    FlagLocalAgent,
				Aliases: []string{"la"},
				Value:   false,
				Usage: "will set crux env to make dagent connect to localhost instead of container network," +
					" it's useful when you use a non-containerized agent",
				Required: false,
				EnvVars:  []string{"LOCAL_AGENT"},
			},
			&ucli.BoolFlag{
				Name:     FlagWrite,
				Aliases:  []string{"w"},
				Value:    false,
				Usage:    "enables writing configuration, storing current state",
				Required: false,
			},
			&ucli.BoolFlag{
				Name:     FlagDebug,
				Value:    false,
				Usage:    "enables debug messages",
				Required: false,
			},
			&ucli.BoolFlag{
				Name:     FlagPreferLocalImages,
				Value:    false,
				Usage:    "prioritize local instead of remote images",
				Required: false,
				EnvVars:  []string{"PRIORITIZE_LOCAL_IMAGES"},
			},
			&ucli.StringFlag{
				Name:        FlagConfigPath,
				Aliases:     []string{"c"},
				Value:       "",
				DefaultText: SettingsPath(),
				Usage:       "persisted configuration path",
				Required:    false,
				EnvVars:     []string{"DYO_CONFIG"},
			},
			&ucli.StringSliceFlag{
				Name:        FlagHosts,
				Aliases:     []string{},
				Value:       ucli.NewStringSlice("localhost"),
				DefaultText: "localhost",
				Usage:       "Use this hosts instead of default one. Eg. 'localhost,extradomain1.example.com,extradomain2.example.com'",
				Required:    false,
			},
			&ucli.StringFlag{
				Name:     FlagImageTag,
				Value:    "",
				Usage:    "image tag, it will override the config",
				Required: false,
				EnvVars:  []string{"DYO_IMAGE_TAG"},
			},
			&ucli.StringFlag{
				Name:        FlagPrefix,
				Value:       "dyo-stable",
				Aliases:     []string{"p"},
				DefaultText: "dyo-stable",
				Usage:       "prefix that is preprended to container names",
				Required:    false,
				EnvVars:     []string{"PREFIX"},
			},
			&ucli.StringFlag{
				Name:     FlagNetwork,
				Value:    "",
				Usage:    "custom network, overriding the configuration",
				Required: false,
				EnvVars:  []string{"DYO_NETWORK"},
			},
			&ucli.BoolFlag{
				Name:     FlagExpectContainerEnv,
				Value:    false,
				Usage:    "everything runs inside containers eg. e2e tests, nothing is exposed to the host",
				Required: false,
				EnvVars:  []string{"DYO_FULLY_CONTAINERIZED"},
			},
			&ucli.BoolFlag{
				Name:    FlagSilent,
				Aliases: []string{"s"},
				Value:   false,
				Usage:   "hides the welcome message and minimizes chattiness",
			},
			&ucli.StringFlag{
				Name:    FlagEnvFile,
				Aliases: []string{"e"},
				Value:   "",
				Usage:   "loads the environment variables into all containers from the specified .env file",
			},
		},
	}
}

func run(cCtx *ucli.Context) error {
	zerolog.SetGlobalLevel(zerolog.InfoLevel)
	if cCtx.Bool(FlagDebug) {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}

	args := ArgsFlags{
		SettingsWrite:      cCtx.Bool(FlagWrite),
		SettingsFilePath:   SettingsFileLocation(cCtx.String(FlagConfigPath)),
		SettingsExists:     SettingsExists(cCtx.String(FlagConfigPath)),
		ImageTag:           cCtx.String(FlagImageTag),
		Prefix:             cCtx.String(FlagPrefix),
		PreferLocalImages:  cCtx.Bool(FlagPreferLocalImages),
		FullyContainerized: cCtx.Bool(FlagExpectContainerEnv),
		Network:            cCtx.String(FlagNetwork),
		Silent:             cCtx.Bool(FlagSilent),
		CruxDisabled:       cCtx.Bool(FlagDisableCrux),
		CruxUIDisabled:     cCtx.Bool(FlagDisableCruxUI),
		LocalAgent:         cCtx.Bool(FlagLocalAgent),
		Command:            cCtx.Command.Name,
		EnvFile:            cCtx.String(FlagEnvFile),
		Hosts:              cCtx.StringSlice(FlagHosts),
	}

	initialState := State{
		Ctx:        context.Background(),
		Containers: &Containers{},
	}

	ProcessCommand(cCtx.Context, &initialState, &args)

	return nil
}
