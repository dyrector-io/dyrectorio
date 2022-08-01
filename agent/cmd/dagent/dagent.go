package main

import (
	"log"

	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/config"
)

func main() {
	var cfg config.Configuration
	err := util.ReadConfig(&cfg)
	if err != nil {
		log.Panic("failed to load configuration: ", err.Error())
	}
	log.Println("Configuration loaded.")

	dagent.Serve(&cfg)
}
