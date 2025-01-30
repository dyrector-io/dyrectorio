package main

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/health"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/internal/version"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/k8s"

	cli "github.com/urfave/cli/v2"
)

func main() {
	app := &cli.App{
		Name:     "crane",
		Version:  version.BuildVersion(),
		HelpName: "crane",
		Usage:    "cli tool for serving a k8s agent of dyrector.io",
		Action:   serve,

		Commands: []*cli.Command{
			{
				Name:    "init",
				Aliases: []string{"i"},
				Usage:   "Init the key on kubernetes cluster",
				Action:  initKey,
			},
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

func loadConfiguration() (*config.Configuration, *k8s.Secret, error) {
	cfg := &config.Configuration{}

	err := util.ReadConfig(cfg)
	if err != nil {
		return nil, nil, errors.Join(err, fmt.Errorf("failed to load configuration"))
	}

	client := k8s.NewClient(cfg)
	secretHandler := k8s.NewSecret(context.Background(), client)

	err = cfg.InjectPrivateKey(secretHandler)
	if err != nil {
		return nil, nil, errors.Join(err, fmt.Errorf("failed to load private key"))
	}

	err = cfg.InjectGrpcToken(secretHandler)
	if err != nil {
		return nil, nil, errors.Join(err, fmt.Errorf("Failed to load gRPC token"))
	}

	log.Info().Msg("Configuration loaded.")
	return cfg, secretHandler, nil
}

func serve(_ *cli.Context) error {
	cfg, secretHandler, err := loadConfiguration()
	if err != nil {
		return err
	}

	return crane.Serve(cfg, secretHandler)
}

func initKey(cCtx *cli.Context) error {
	cfg, secretHandler, err := loadConfiguration()
	if err != nil {
		return err
	}

	client := k8s.NewClient(cfg)
	namespace := cfg.Namespace
	namespaceHandler := k8s.NewNamespaceClient(cCtx.Context, namespace, client)
	err = namespaceHandler.EnsureExists(namespace)
	if err != nil {
		log.Error().Err(err).Send()
		return err
	}

	_, err = secretHandler.GetOrCreatePrivateKey()
	if err != nil {
		log.Error().Err(err).Send()
		return err
	}

	return nil
}

func getHealth(_ *cli.Context) error {
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
