package cli

import (
	"fmt"

	"github.com/dyrector-io/dyrectorio/golang/pkg/cli/compose"
	ucli "github.com/urfave/cli/v2"
)

const (
	GenerateCommand = "generate"
)

func GetGenerateCommand() *ucli.Command {
	return &ucli.Command{
		Name:        GenerateCommand,
		Aliases:     []string{"g", "gen"},
		Action:      ucli.ShowSubcommandHelp,
		Usage:       "dyo gen <component> <....>",
		UsageText:   "dyo gen crux encryption-key",
		Description: "Some components need tokens or keys, these helpers could be used to generate them",
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
			{
				Name:            "compose",
				Action:          compose.GenerateComposeConfig,
				Usage:           "dyo gen compose",
				UsageText:       "Additional usage text",
				SkipFlagParsing: true,
			},
		},
	}
}
