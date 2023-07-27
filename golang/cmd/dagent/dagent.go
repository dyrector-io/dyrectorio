package main

import (
	"os"

	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/health"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/internal/version"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"

	cli "github.com/urfave/cli/v2"

	commonConfig "github.com/dyrector-io/dyrectorio/golang/internal/config"
)

func serve(cCtx *cli.Context) error {
	cfg := config.Configuration{}

	err := util.ReadConfig(&cfg)
	if err != nil {
		log.Panic().Err(err).Msg("Failed to load configuration")
	}
	if err := cfg.ParseAndSetJWT(os.Getenv("GRPC_TOKEN")); err != nil {
		log.Panic().Err(err).Msg("Failed to parse env GRPC_TOKEN")
	}

	commonConfig.InjectSecret(string(cfg.SecretPrivateKeyFile), &cfg.CommonConfiguration)

	log.Info().Msg("Configuration loaded.")

	dagent.Serve(&cfg)

	return nil
}

func getHealth(cCtx *cli.Context) error {
	healthy, err := health.GetHealthy()
	if err != nil {
		log.Error().Err(err).Send()
	}

	if healthy {
		os.Exit(0)
		return nil
	}

	os.Exit(1)
	return nil
}

func main() {
	app := &cli.App{
		Name:     "dagent",
		Version:  version.BuildVersion(),
		HelpName: "dagent",
		Usage:    "cli tool for serving a Docker agent of dyrector.io",
		Action:   serve,

		Commands: []*cli.Command{
			{
				Name:    "health",
				Aliases: []string{"h"},
				Usage:   "Get the health of the agent",
				Action:  getHealth,
			},
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal().Err(err).Send()
	}
}
