// dyrector.io command line application, helps with development, testing, and demonstration.
// NOT FOR PRODUCTION USE
package main

import (
	"os"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/pkg/cli"
)

func main() {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout})

	app := cli.InitCLI()

	if err := app.Run(os.Args); err != nil {
		log.Fatal().Err(err).Send()
	}
}
