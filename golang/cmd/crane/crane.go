package main

import (
	"os"

	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
)

func main() {
	var cfg config.Configuration
	err := util.ReadConfig(&cfg)
	if err != nil {
		log.Panic().Err(err).Msg("failed to load configuration")
	}
	if err := cfg.ParseAndSetJWT(os.Getenv("GRPC_TOKEN")); err != nil {
		log.Panic().Err(err).Msg("failed to parse env GRPC_TOKEN")
	}
	log.Print("Configuration loaded.")
	crane.Serve(&cfg)
}