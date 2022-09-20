package main

import (
	"log"
	"os"

	cli "github.com/urfave/cli/v2"
)

const version = "0.1.1"

func main() {
	app := &cli.App{
		Name:     "dyo",
		Version:  version,
		HelpName: "dyo",
		Usage:    "dyo - cli tool for deploying a complete dyrector.io stack locally, for demonstration, testing, or development purposes",

		Commands: []*cli.Command{
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
		Flags: []cli.Flag{
			&cli.BoolFlag{
				Name:     "disable-crux",
				Aliases:  []string{"dc"},
				Value:    false,
				Usage:    "disable crux(backend) service",
				Required: false,
				EnvVars:  []string{"DISABLE_CRUX"},
			},
			&cli.BoolFlag{
				Name:     "disable-crux-ui",
				Aliases:  []string{"dcu"},
				Value:    false,
				Usage:    "disable crux-ui(frontend) service",
				Required: false,
				EnvVars:  []string{"DISABLE_CRUXUI"},
			},
			&cli.BoolFlag{
				Name:     "write",
				Aliases:  []string{"w"},
				Value:    false,
				Usage:    "enables writing configuration, storing current state",
				Required: false,
			},
			&cli.StringFlag{
				Name:     "config",
				Aliases:  []string{"c"},
				Value:    "",
				Usage:    "configuration location",
				Required: false,
				EnvVars:  []string{"DYO_CONFIG"},
			},
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}

func run(cCtx *cli.Context) error {
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
