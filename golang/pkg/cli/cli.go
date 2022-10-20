package cli

import (
	ucli "github.com/urfave/cli/v2"

	"github.com/dyrector-io/dyrectorio/golang/internal/version"
)

func InitCLI() *ucli.App {
	return &ucli.App{
		Name:     "dyo",
		Version:  version.BuildVersion(),
		HelpName: "dyo",
		Usage:    "dyo - cli tool for deploying a complete dyrector.io stack locally, for demonstration, testing, or development purposes",

		Commands: []*ucli.Command{
			{
				Name:    "up",
				Aliases: []string{"u"},
				Usage:   "Run the stack",
				Action:  run,
			},
			{
				Name:    "down",
				Aliases: []string{"d"},
				Usage:   "Stop the stack",
				Action:  run,
			},
		},
		Flags: []ucli.Flag{
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
				Name:     "write",
				Aliases:  []string{"w"},
				Value:    false,
				Usage:    "enables writing configuration, storing current state",
				Required: false,
			},
			&ucli.StringFlag{
				Name:     "config",
				Aliases:  []string{"c"},
				Value:    "",
				Usage:    "configuration location",
				Required: false,
				EnvVars:  []string{"DYO_CONFIG"},
			},
		},
	}
}

func run(cCtx *ucli.Context) error {
	state := Settings{
		SettingsWrite:    cCtx.Bool("write"),
		SettingsFilePath: SettingsFileLocation(cCtx.String("config")),
		SettingsExists:   SettingsExists(cCtx.String("config")),
		Containers: Containers{
			CruxUI: ContainerSettings{
				Disabled: cCtx.Bool("disable-crux-ui"),
			},
			Crux: ContainerSettings{
				Disabled: cCtx.Bool("disable-crux"),
			},
		},
		Command: cCtx.Command.Name,
	}

	settings := SettingsFileReadWrite(&state)
	ProcessCommand(settings)

	return nil
}
