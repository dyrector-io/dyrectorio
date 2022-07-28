package dagent

import (
	"context"
	"fmt"
	"log"
	"net/http"

	healthcheck "github.com/RaMin0/gin-health-check"
	"github.com/gin-gonic/gin"

	"github.com/dyrector-io/dyrectorio/agent/internal/grpc"
	"github.com/dyrector-io/dyrectorio/agent/internal/sigmalr"
	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	"github.com/dyrector-io/dyrectorio/agent/pkg/api/validate"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/config"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/model"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/routes"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/update"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/utils"
)

// @title DAgent API Swagger
// @version 2.0
// @description DAgent server API docs. Scope: container management on remote nodes.
// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html
// @BasePath /v1
// @schemes http
func Serve(cfg *config.Configuration) {
	utils.PreflightChecks(cfg)
	log.Println("Starting dyrector.io DAgent service")

	httpPort := cfg.HTTPPort
	grpcToken := cfg.GrpcToken
	grpcInsecure := cfg.GrpcInsecure

	if httpPort == 0 && grpcToken == "" {
		log.Panic("no http port nor grpc address was provided")
	}

	if cfg.Debug {
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
		// r.Use(util.RequestLogger())
		// example:
		// curl -iL -XGET -H "X-Health-Check: 1" http://localhost:8080
		r.Use(healthcheck.Default())
		r.Use(util.ConfigMiddleware(cfg))
		validate.RouterWithValidators(r, routes.SetupRouter)
	}

	blocking := httpPort == 0
	if grpcToken != "" {
		grpcParams, err := grpc.GrpcTokenToConnectionParams(grpcToken, grpcInsecure)
		if err != nil {
			log.Panic("gRPC token error: ", err)
		}

		log.Println("Running gRPC in blocking mode: ", blocking)
		grpcContext := grpc.WithGRPCConfig(context.TODO(), cfg)
		if blocking {
			grpc.Init(grpcContext, grpcParams, &cfg.CommonConfiguration, grpc.WorkerFunctions{
				Deploy: utils.DeployImage,
				Watch:  utils.GetContainersByNameCrux,
			})
		} else {
			go grpc.Init(grpcContext, grpcParams, &cfg.CommonConfiguration, grpc.WorkerFunctions{
				Deploy: utils.DeployImage,
				Watch:  utils.GetContainersByNameCrux,
			})
		}
	} else {
		log.Println("No gRPC configuration was provided")
	}

	update.InitUpdater(r, httpPort, cfg)

	if cfg.TraefikEnabled {
		params := model.TraefikDeployRequest{
			LogLevel: cfg.TraefikLogLevel,
			TLS:      cfg.TraefikTLS,
			AcmeMail: cfg.TraefikAcmeMail,
		}

		err := utils.ExecTraefik(context.TODO(), params, cfg)
		if err != nil {
			// we wanted to start traefik, but something is not ok, thus panic!
			log.Panic("Failed to start Traefik: ", err)
		}
	}

	if r != nil {
		srv := &http.Server{
			Addr:              fmt.Sprintf(":%d", httpPort),
			Handler:           r,
			ReadHeaderTimeout: cfg.ReadHeaderTimeout,
		}

		if err := srv.ListenAndServe(); err != nil {
			log.Printf("listen error: %s\n", err)
		}
	}
}
