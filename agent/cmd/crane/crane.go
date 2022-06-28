package main

import (
	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"
)

func main() {
	util.ReadConfig(&config.Cfg)
	crane.Serve()
}
