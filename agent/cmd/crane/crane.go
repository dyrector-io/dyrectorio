package main

import (
	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"
)

func main() {
	var cfg config.Configuration
	util.ReadConfig(&cfg)
	crane.Serve(&cfg)
}
