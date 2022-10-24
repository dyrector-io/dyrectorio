package main

import (
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
	log.Print("Configuration loaded.")

	crane.Serve(&cfg)
}
