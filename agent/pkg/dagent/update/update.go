package update

import (
	"context"
	"log"

	"github.com/gin-gonic/gin"

	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/config"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/controller"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/utils"
)

func InitUpdater(r *gin.Engine, httpPort int, cfg *config.Configuration) {
	switch cfg.UpdateMethod {
	case "webhook":
		if httpPort == 0 {
			log.Fatal("cannot use webhook without a http port in use")
		}
		log.Println("Update mode: webhook")
		log.Println("Remote DAgent image: " + cfg.DagentImage + ":" + cfg.DagentTag)
		SetupUpdate(r)
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

func SetupUpdate(r *gin.Engine) *gin.Engine {
	r.POST("update", controller.UpdateRunningDAgent)
	return r
}
