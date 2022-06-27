package main

import (
	"gitlab.com/dyrector_io/dyrector.io/go/internal/util"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent/config"
)

func main() {
	util.ReadConfig(&config.Cfg)
	dagent.Serve()
}
