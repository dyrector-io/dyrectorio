package main

import (
	"log"
	"os"

	"github.com/dyrector-io/dyrectorio/golang/pkg/cli"
)

func main() {
	app := cli.InitCLI()

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}
