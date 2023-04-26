package utils

import (
	"context"
	"errors"

	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"

	dockerHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	containerRuntime "github.com/dyrector-io/dyrectorio/golang/internal/runtime/container"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
)

func PreflightChecks(cfg *config.Configuration) {
	ctx := context.Background()

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Stack().Err(err).Send()
	}

	_, err = dockerHelper.GetAllContainers(ctx)
	if err != nil {
		log.Fatal().Stack().Err(err).Send()
	}

	err = containerRuntime.VersionCheck(ctx, cli)
	if err != nil {
		if errors.Is(err, containerRuntime.ErrServerIsOutdated) {
			log.Warn().Stack().Err(err).Msg("Server version is outdated, please consider updating.")
		} else {
			log.Fatal().Stack().Err(err).Send()
		}
	}
}
