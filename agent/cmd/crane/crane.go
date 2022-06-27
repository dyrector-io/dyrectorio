package main

import (
	"gitlab.com/dyrector_io/dyrector.io/go/internal/util"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/crane"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/crane/config"
)

func main() {
	util.ReadConfig(&config.Cfg)
	crane.Serve()
}
