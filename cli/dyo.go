package main

import (
	"log"
	"os"
	"time"

	cli "github.com/urfave/cli/v2"
)

func main() {
	app := &cli.App{
		Name:      "dyo",
		Version:   "0.1.1",
		Compiled:  time.Now(),
		HelpName:  "dyo",
		Usage:     "demonstrate available API",
		UsageText: "contrive - demonstrating the available API",
		ArgsUsage: "[args and such]",

		Commands: []*cli.Command{
			{
				Name:    "init",
				Aliases: []string{"i"},
				Usage:   "initalize",

				Action: templating,
			},
			{
				Name: "demo",
				Subcommands: []*cli.Command{
					{
						Name:   "template",
						Action: templating,
					},
				},
			},
			{
				Name: "dev",
			},
		},
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:     "disable",
				Value:    "none",
				Usage:    "disable service",
				Required: false,
			},
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}

func templating(cCtx *cli.Context) error {
	var err error
	switch cCtx.String("disable") {
	case "crux":
		err, _ = GenContainer([]Services{"crux-ui", "utils"})
	case "crux-ui":
		err, _ = GenContainer([]Services{"crux", "utils"})
	default:
		err, _ = GenContainer([]Services{"crux", "crux-ui", "utils"})
	}

	if err != nil {
		return err
	}

	return nil
}
