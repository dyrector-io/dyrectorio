package update

import (
	"context"

	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/utils"
)

func InitUpdater(cfg *config.Configuration) {
	switch cfg.UpdateMethod {
	case "poll":
		log.Print("Update mode: polling")
		log.Print("Remote DAgent image: " + cfg.DagentImage + ":" + cfg.DagentTag)
		if err := utils.ExecWatchtowerPoll(context.Background(), cfg); err != nil {
			log.Error().Stack().Err(err).Msg("Error starting watchtower")
		}
	case "off":
	default:
		log.Print("No update was set up")
	}
}
