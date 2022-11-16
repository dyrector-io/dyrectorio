package main

import (
	"os"

	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"

	commonConfig "github.com/dyrector-io/dyrectorio/golang/internal/config"
)

func main() {
	cfg := config.Configuration{}
	err := util.ReadConfig(&cfg)
	if err != nil {
		log.Panic().Err(err).Msg("failed to load configuration")
	}
	if err := cfg.ParseAndSetJWT(os.Getenv("GRPC_TOKEN")); err != nil {
		log.Panic().Err(err).Msg("failed to parse env GRPC_TOKEN")
	}
	commonConfig.InjectSecret(string(cfg.SecretPrivateKeyFile), &cfg.CommonConfiguration)
	log.Info().Msg("Configuration loaded.")
	dagent.Serve(&cfg)
}
