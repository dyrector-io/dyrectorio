package cli

import (
	"fmt"

	"github.com/rs/zerolog"
	ucli "github.com/urfave/cli/v2"

	"github.com/dyrector-io/dyrectorio/golang/internal/version"
)

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
		},
		Flags: flags(),
	}
}

func flags() []ucli.Flag {
	return []ucli.Flag{
		&ucli.BoolFlag{
			Name:     "disable-crux",
			Aliases:  []string{"dc"},
			Value:    false,
			Usage:    "disable crux(backend) service",
			Required: false,
			EnvVars:  []string{"DISABLE_CRUX"},
		},
		&ucli.BoolFlag{
			Name:     "disable-crux-ui",
			Aliases:  []string{"dcu"},
			Value:    false,
			Usage:    "disable crux-ui(frontend) service",
			Required: false,
			EnvVars:  []string{"DISABLE_CRUXUI"},
		},
		&ucli.BoolFlag{
			Name:    "local-agent",
			Aliases: []string{"la"},
			Value:   false,
			Usage: "will set crux env to make dagent connect to localhost instead of container network," +
				" it's useful when you use a non-containerized agent",
			Required: false,
			EnvVars:  []string{"LOCAL_AGENT"},
		},
		&ucli.BoolFlag{
			Name:     "write",
			Value:    false,
			Usage:    "enables writing configuration, storing current state",
			Required: false,
		},
		&ucli.BoolFlag{
			Name:     "debug",
			Value:    false,
			Usage:    "enables debug messages",
			Required: false,
		},
		&ucli.BoolFlag{
			Name:     "disable-forcepull",
			Value:    false,
			Usage:    "try to use images locally available",
			Required: false,
			EnvVars:  []string{"DISABLE_FORCEPULL"},
		},
		&ucli.BoolFlag{
			Name:     "disable-podman-checks",
			Value:    false,
			Usage:    "disabling podman checks, useful when you run the CLI in a container",
			Required: false,
			EnvVars:  []string{"DISABLE_PODMAN_CHECKS"},
		},
		&ucli.StringFlag{
			Name:     "config",
			Aliases:  []string{"c"},
			Value:    "",
			Usage:    fmt.Sprintf("configuration location, default location: %s", SettingsPath()),
			Required: false,
			EnvVars:  []string{"DYO_CONFIG"},
		},
		&ucli.StringFlag{
			Name:     "imagetag",
			Value:    "",
			Usage:    "image tag, it will override the config",
			Required: false,
			EnvVars:  []string{"DYO_IMAGE_TAG"},
		},
		&ucli.StringFlag{
			Name:  "local-imagetag",
			Value: "",
			Usage: "special local image tag, CLI will try to find it and use it, otherwise " +
				"it will fall back to config",
			Required: false,
			EnvVars:  []string{"DYO_LOCAL_IMAGE_TAG"},
		},
		&ucli.StringFlag{
			Name:     "network",
			Value:    "",
			Usage:    "custom network, overriding the configuration",
			Required: false,
			EnvVars:  []string{"DYO_NETWORK"},
		},
		&ucli.BoolFlag{
			Name:     "expect-container-env",
			Value:    false,
			Usage:    "when both the stack and observer are running inside containers, like during e2e tests",
			Required: false,
			EnvVars:  []string{"DYO_FULLY_CONTAINERIZED"},
		},
	}
}

func run(cCtx *ucli.Context) error {
	zerolog.SetGlobalLevel(zerolog.InfoLevel)
	if cCtx.Bool("debug") {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}

	state := Settings{
		SettingsWrite:       cCtx.Bool("write"),
		SettingsFilePath:    SettingsFileLocation(cCtx.String("config")),
		SettingsExists:      SettingsExists(cCtx.String("config")),
		DisableForcepull:    cCtx.Bool("disable-forcepull"),
		ImageTag:            cCtx.String("imagetag"),
		SpecialImageTag:     cCtx.String("local-imagetag"),
		DisablePodmanChecks: cCtx.Bool("disable-podman-checks"),
		FullyContainerized:  cCtx.Bool("expect-container-env"),
		Network:             cCtx.String("network"),
		Containers: Containers{
			CruxUI: ContainerSettings{
				Disabled: cCtx.Bool("disable-crux-ui"),
			},
			Crux: ContainerSettings{
				Disabled:   cCtx.Bool("disable-crux"),
				LocalAgent: cCtx.Bool("local-agent"),
			},
		},
		Command: cCtx.Command.Name,
	}

	settings := SettingsFileReadWrite(&state)
	ProcessCommand(settings)

	return nil
}
