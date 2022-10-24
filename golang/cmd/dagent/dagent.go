package main

import (
	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
)

func main() {
	var cfg config.Configuration
	err := util.ReadConfig(&cfg)
	if err != nil {
		log.Panic().Err(err).Msg("failed to load configuration")
	}
	log.Print("Configuration loaded.")

	dagent.Serve(&cfg)
}
