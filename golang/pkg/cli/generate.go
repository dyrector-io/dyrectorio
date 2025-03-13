package cli

import (
	"fmt"

	ucli "github.com/urfave/cli/v2"

	"github.com/dyrector-io/dyrectorio/golang/pkg/cli/setup"
)

const (
	GenerateCommand = "generate"
)

func GetGenerateCommand() *ucli.Command {
	return &ucli.Command{
		Name:        GenerateCommand,
		Aliases:     []string{"g", "gen", "generate"},
		Action:      ucli.ShowSubcommandHelp,
		Usage:       "dyo gen <component> <..options..>",
		UsageText:   "dyo gen <component> help to discover possibilities",
		Description: "Some components need tokens, or configuration files this helps to generate them",
		Subcommands: []*ucli.Command{
			{
				Name:   "crux",
				Action: ucli.ShowSubcommandHelp,
				Usage:  "dyo gen crux encryption-key",
				Subcommands: []*ucli.Command{{
					Name: "encryption-key",
					Action: func(_ *ucli.Context) error {
						//nolint:forbidigo
						fmt.Print(generateCruxEncryptionKey())
						return nil
					},
				}},
			},
			setup.Setup(),
		},
	}
}
