package main

import (
	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/config"
)

func main() {
	util.ReadConfig(&config.Cfg)
	dagent.Serve()
}
