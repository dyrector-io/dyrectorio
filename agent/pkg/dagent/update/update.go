package update

import (
	"log"

	"github.com/gin-gonic/gin"

	"gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent/config"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent/controller"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent/utils"
)

func InitUpdater(r *gin.Engine, httpPort int) {
	switch config.Cfg.UpdateMethod {
	case "webhook":
		if httpPort == 0 {
			log.Fatal("cannot use webhook without a http port in use")
		}
		log.Println("Update mode: webhook")
		log.Println("Remote DAgent image: " + config.Cfg.DagentImage + ":" + config.Cfg.DagentTag)
		SetupUpdate(r)
	case "poll":
		log.Println("Update mode: polling")
		log.Println("Remote DAgent image: " + config.Cfg.DagentImage + ":" + config.Cfg.DagentTag)
		if err := utils.ExecWatchtowerPoll(); err != nil {
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
