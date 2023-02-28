package utils

import (
	"context"
	"fmt"

	"github.com/hashicorp/go-version"
	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
	dockerHelper "github.com/dyrector-io/dyrectorio/golang/pkg/helper/docker"
)

func PreflightChecks(cfg *config.Configuration) {
	_, err := dockerHelper.GetAllContainers(context.Background())
	if err != nil {
		log.Fatal().Stack().Err(err).Send()
	}

	versions, err := GetServerInformation()
	if err != nil {
		log.Fatal().Stack().Err(err).Msg("Version error")
	}

	log.Info().Str("dockerVersion", versions.ServerVersion).Str("dockerClientVersion", versions.ClientVersion).Send()

	serVer, err := version.NewVersion(versions.ServerVersion)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Invalid version string from server")
	}
	constraints, _ := version.NewConstraint(fmt.Sprintf(">=%s", cfg.MinDockerServerVersion))
	if err != nil {
		log.Error().Stack().Err(err).Msg("Error with version constraint")
	}
	if !constraints.Check(serVer) {
		log.Warn().
			Str("serverVersion", serVer.String()).
			Str("minVersion", cfg.MinDockerServerVersion).
			Msg("Server is behind the supported version")
	}
}
