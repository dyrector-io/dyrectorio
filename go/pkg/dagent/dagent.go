package dagent

import (
	"context"
	"fmt"
	"log"
	"net/http"

	healthcheck "github.com/RaMin0/gin-health-check"
	"github.com/gin-gonic/gin"
	"gitlab.com/dyrector_io/dyrector.io/go/internal/grpc"
	"gitlab.com/dyrector_io/dyrector.io/go/internal/sigmalr"
	"gitlab.com/dyrector_io/dyrector.io/go/internal/util"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/api/validate"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent/config"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent/model"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent/routes"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent/update"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent/utils"
)

// @title DAgent API Swagger
// @version 2.0
// @description DAgent server API docs. Scope: container management on remote nodes.
// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html
// @BasePath /v1
// @schemes http
func Serve() {
	utils.PreflightChecks()
	log.Println("Starting dyrector.io DAgent service")

	httpPort := config.Cfg.HTTPPort
	grpcToken := config.Cfg.GrpcToken
	grpcInsecure := config.Cfg.GrpcInsecure

	if httpPort == 0 && grpcToken == "" {
		panic("no http port nor grpc address was provided")
	}

	if config.Cfg.Debug {
		gin.SetMode(gin.DebugMode)
		log.Println("DebugMode set.")
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	var r *gin.Engine
	if httpPort != 0 {
		log.Println("http port: ", httpPort)
		r = gin.Default()
		sigmalr.SetupHub(r)
		r.Use(util.RequestLogger())
		// example:
		// curl -iL -XGET -H "X-Health-Check: 1" http://localhost:8080
		r.Use(healthcheck.Default())
		validate.RouterWithValidators(r, routes.SetupRouter)
	}

	blocking := httpPort == 0
	if grpcToken != "" {
		grpcParams, err := grpc.GrpcTokenToConnectionParams(grpcToken, grpcInsecure)
		if err != nil {
			panic(err)
		}
		log.Println("Running gRPC in blocking mode: ", blocking)
		if blocking {
			grpc.Init(grpcParams, &config.Cfg.CommonConfiguration, grpc.WorkerFunctions{
				Deploy: utils.DeployImage,
				Watch:  utils.GetContainersByNameCrux,
			})
		} else {
			go grpc.Init(grpcParams, &config.Cfg.CommonConfiguration, grpc.WorkerFunctions{
				Deploy: utils.DeployImage,
				Watch:  utils.GetContainersByNameCrux,
			})
		}
	} else {
		log.Println("No gRPC configuration was provided")
	}

	update.InitUpdater(r, httpPort)

	if config.Cfg.TraefikEnabled {
		params := model.TraefikDeployRequest{
			LogLevel: config.Cfg.TraefikLogLevel,
			TLS:      config.Cfg.TraefikTLS,
			AcmeMail: config.Cfg.TraefikAcmeMail,
		}

		err := utils.ExecTraefik(context.TODO(), params)
		if err != nil {
			// we wanted to start traefik, but something is not ok, thus panic!
			panic(err)
		}
	}

	if r != nil {
		srv := &http.Server{
			Addr:              fmt.Sprintf(":%d", httpPort),
			Handler:           r,
			ReadHeaderTimeout: config.Cfg.ReadHeaderTimeout,
		}

		if err := srv.ListenAndServe(); err != nil {
			log.Printf("listen error: %s\n", err)
		}
	}
}
