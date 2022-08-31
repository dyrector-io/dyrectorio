package update

import (
	"context"
	"log"

	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/config"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/utils"
)

func InitUpdater(cfg *config.Configuration) {
	switch cfg.UpdateMethod {
	case "poll":
		log.Println("Update mode: polling")
		log.Println("Remote DAgent image: " + cfg.DagentImage + ":" + cfg.DagentTag)
		if err := utils.ExecWatchtowerPoll(context.Background(), cfg); err != nil {
			log.Println("Error starting watchtower: " + err.Error())
		}
	case "off":
	default:
		log.Println("No update was set up")
	}
}
