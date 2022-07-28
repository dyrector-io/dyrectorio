package main

import (
	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/config"
)

func main() {
	var cfg config.Configuration
	util.ReadConfig(&cfg)
	dagent.Serve(&cfg)
}
