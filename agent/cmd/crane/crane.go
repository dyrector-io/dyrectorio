package main

import (
	"log"

	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"
)

func main() {
	var cfg config.Configuration
	err := util.ReadConfig(&cfg)
	if err != nil {
		log.Panic("Failed to load configuration: ", err.Error())
	}
	log.Println("Configuration loaded.")

	crane.Serve(&cfg)
}
