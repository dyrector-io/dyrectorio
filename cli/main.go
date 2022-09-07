package main

import (
	"log"
	"os"

	cli "github.com/urfave/cli/v2"
)

func main() {
	app := &cli.App{
		Name:     "dyo",
		Version:  "0.1.1",
		HelpName: "dyo",
		Usage:    "dyo - cli tool for deploying a complete dyrector.io stack locally, for demonstration, testing, or development purposes",

		Commands: []*cli.Command{
			{
				Name:    "gen",
				Aliases: []string{"g", "generate"},
				Usage:   "Create a docker-compose.yaml",
				Action:  writeCompose,
			},
			{
				Name:    "up",
				Aliases: []string{"u"},
				Usage:   "Run the stack",
				Action:  up,
			},
			{
				Name:    "down",
				Aliases: []string{"d"},
				Usage:   "Stop the stack",
				Action:  down,
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

// Write compose file
func writeCompose(cCtx *cli.Context) error {
	services := serviceSelector(cCtx)

	containers, err := GenContainer(services, cCtx.Bool("store"))
	if err != nil {
		return err
	}

	err = os.WriteFile("docker-compose.yaml", []byte(containers), FilePerms)
	if err != nil {
		return err
	}

	return nil
}

// Write compose file and start the compose process
func up(cCtx *cli.Context) error {
	services := serviceSelector(cCtx)

	containers, err := GenContainer(services, cCtx.Bool("store"))
	if err != nil {
		return err
	}

	err = os.WriteFile("docker-compose.yaml", []byte(containers), FilePerms)
	if err != nil {
		return err
	}

	err = RunContainers(true, false)
	if err != nil {
		return err
	}

	return nil
}

// Stop the compose process
func down(cCtx *cli.Context) error {
	err := RunContainers(false, true)
	if err != nil {
		return err
	}

	return nil
}

// Service disabling based on parsing command line parameters
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

// Service disabling
func disableService(services []Services, service Services) []Services {
	var newServices []Services
	for _, item := range services {
		if item != service {
			newServices = append(newServices, item)
		}
	}

	return newServices
}
