package utils

import (
	"fmt"

	"github.com/hashicorp/go-version"
	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
)

func PreflightChecks(cfg *config.Configuration) {
	_, err := ListContainers()
	if err != nil {
		log.Fatal().Stack().Err(err).Msg("")
	}

	versions, err := GetServerInformation()
	if err != nil {
		log.Fatal().Stack().Err(err).Msg("Version error")
	}

	log.Info().Str("dockerVersion", versions.ServerVersion).Str("dockerClientVersion", versions.ClientVersion).Msg("")

	serVer, err := version.NewVersion(versions.ServerVersion)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Invalid version string from server")
	}
	constraints, _ := version.NewConstraint(fmt.Sprintf(">=%s", cfg.MinDockerServerVersion))
	if err != nil {
		log.Error().Stack().Err(err).Msg("Error with version constraint")
	}
	if !constraints.Check(serVer) {
		log.Printf("WARNING: server is behind the supported version %s < %s", serVer, cfg.MinDockerServerVersion)
	}
}
