package main

import (
	"log"

	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
)

func main() {
	var cfg config.Configuration
	err := util.ReadConfig(&cfg)
	if err != nil {
		log.Panic("failed to load configuration: ", err.Error())
	}
	log.Println("Configuration loaded.")

	crane.Serve(&cfg)
}
