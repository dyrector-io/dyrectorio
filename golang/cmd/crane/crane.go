package main

import (
	"context"
	"os"

	"github.com/rs/zerolog/log"

	commonConfig "github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/internal/version"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/k8sconfig"

	cli "github.com/urfave/cli/v2"
)

func main() {
	app := &cli.App{
		Name:     "crane",
		Version:  version.BuildVersion(),
		HelpName: "crane",
		Usage:    "crane - cli tool for serving a k8s agent of dyrector.io!",
		Action:   serve,

		Commands: []*cli.Command{
			{
				Name:    "init",
				Aliases: []string{"i"},
				Usage:   "Init the key on kubernetes cluster",
				Action:  initKey,
			},
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal().Err(err)
	}
}

func loadConfiguration() config.Configuration {
	var cfg config.Configuration
	err := util.ReadConfig(&cfg)
	if err != nil {
		log.Panic().Err(err).Msg("failed to load configuration")
	}
	if err := cfg.ParseAndSetJWT(os.Getenv("GRPC_TOKEN")); err != nil {
		log.Panic().Err(err).Msg("failed to parse env GRPC_TOKEN")
	}
	log.Print("Configuration loaded.")
	return cfg
}

func serve(cCtx *cli.Context) error {
	cfg := loadConfiguration()

	secret, err := k8sconfig.GetValidSecret(context.Background(), cfg.Namespace, cfg.SecretName, &cfg)
	if err != nil {
		return err
	}

	commonConfig.InjectSecret(secret, &cfg.CommonConfiguration)

	crane.Serve(&cfg)
	return nil
}

func initKey(cCtx *cli.Context) error {
	cfg := loadConfiguration()

	_, err := k8sconfig.GetValidSecret(context.Background(), cfg.Namespace, cfg.SecretName, &cfg)
	if err != nil {
		return err
	}

	return nil
}
