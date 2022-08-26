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
				Usage:   "Create a docker-compose.yaml",

				Action: compose,
			},
			{
				Name:    "run",
				Aliases: []string{"r"},
				Usage:   "Run the stack",

				Action: run,
			},
			// {
			// 	Name: "demo",
			// 	Subcommands: []*cli.Command{
			// 		{
			// 			Name:   "template",
			// 			Action: templating,
			// 		},
			// 	},
			// },
			{
				Name: "dev",
			},
		},
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:     "disable-crux",
				Value:    "none",
				Usage:    "disable crux(backend) service",
				Required: false,
			},
			&cli.StringFlag{
				Name:     "disable-crux-ui",
				Value:    "none",
				Usage:    "disable crux-ui(frontend) service",
				Required: false,
			},
			&cli.BoolFlag{
				Name:     "store",
				Value:    false,
				Usage:    "enables writing configuration, storing state",
				Required: false,
			},
			&cli.BoolFlag{
				Name:     "ignore-config",
				Value:    false,
				Usage:    "ignores configuration",
				Required: false,
			},
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}

func compose(cCtx *cli.Context) error {
	services := serviceSelector(cCtx)
	err, containers := GenContainer(services, cCtx.Bool("store"))
	if err != nil {
		return err
	}
	err = WriteComposeFile(containers)
	if err != nil {
		return err
	}
	return nil
}

func run(cCtx *cli.Context) error {
	services := serviceSelector(cCtx)
	err, containers := GenContainer(services, cCtx.Bool("store"))
	if err != nil {
		return err
	}
	err = RunContainers(containers, true)
	if err != nil {
		return err
	}
	return nil
}

func stop(cCtx *cli.Context) error {
	services := serviceSelector(cCtx)
	err, containers := GenContainer(services, cCtx.Bool("store"))
	if err != nil {
		return err
	}
	err = RunContainers(containers, false)
	if err != nil {
		return err
	}
	return nil
}

func serviceSelector(cCtx *cli.Context) []Services {
	services := []Services{Crux, CruxUI, Utils}

	if cCtx.Bool("disable-crux-ui") {
		services = disableService(services, CruxUI)
	}
	if cCtx.Bool("disable-crux") {
		services = disableService(services, Crux)
	}

	return services
}

func disableService(services []Services, service Services) []Services {
	var newServices []Services
	for _, item := range services {
		if item != service {
			newServices = append(newServices, item)
		}
	}
	return newServices
}
