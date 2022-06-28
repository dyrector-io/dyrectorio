package crane

import (
	"fmt"
	"log"
	"net/http"

	healthcheck "github.com/RaMin0/gin-health-check"
	"github.com/gin-gonic/gin"
	"k8s.io/apimachinery/pkg/api/resource"

	"github.com/dyrector-io/dyrectorio/agent/internal/grpc"
	"github.com/dyrector-io/dyrectorio/agent/internal/sigmalr"
	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	"github.com/dyrector-io/dyrectorio/agent/pkg/api/validate"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/crux"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/k8s"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/route"
)

// checks before start
// all the runtime dependencies to be checked
func preflightChecks() {
	if config.Cfg.IngressRootDomain == "" {
		log.Panicf("Env %v is not set, it is needed to expose any service.", "INGRESS_ROOT_DOMAIN")
	}

	size := config.Cfg.DefaultVolumeSize
	if size != "" {
		_, err := resource.ParseQuantity(size)
		if err != nil {
			log.Panicf("Provided env var %s has errnous value %s\n%s", "DEFAULT_VOLUME_SIZE", size, err.Error())
		}
	}
}

// @title crane API Swagger
// @version 2.0
// @description crane server API docs. Scope: container management on remote nodes.
// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html
// @BasePath /v1
// @schemes http
func Serve() {
	preflightChecks()
	log.Println("Starting dyrector.io crane service.")

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
	if httpPort == 0 && grpcToken == "" {
		panic("No http port nor grpc token was provided!")
	}

	var r *gin.Engine

	if httpPort != 0 {
		log.Println("http port: ", httpPort)
		r = gin.Default()
		r.Use(util.RequestLogger())
		sigmalr.SetupHub(r)

		validate.RouterWithValidators(r, route.SetupRouterV1)
		// example:
		// curl -iL -XGET -H "X-Health-Check: 1" http://localhost:8080
		r.Use(healthcheck.Default())
	}

	// TODO: add update methods
	// switch config.Cfg.UpdateMethod {
	// case "off":
	// default:
	log.Println("No update was set up")
	// }

	blocking := httpPort == 0
	if grpcToken != "" {
		grpcParams, err := grpc.GrpcTokenToConnectionParams(grpcToken, grpcInsecure)

		if err != nil {
			panic(err)
		}

		log.Println("Running gRPC in blocking mode: ", blocking)
		if blocking {
			grpc.Init(grpcParams, &config.Cfg.CommonConfiguration, grpc.WorkerFunctions{Deploy: k8s.Deploy, Watch: crux.GetDeployments})
		} else {
			go grpc.Init(grpcParams, &config.Cfg.CommonConfiguration, grpc.WorkerFunctions{Deploy: k8s.Deploy, Watch: crux.GetDeployments})
		}
	} else {
		log.Println("No gRPC configuration was provided")
	}

	if httpPort != 0 {
		srv := &http.Server{
			Addr:              fmt.Sprintf(":%d", httpPort),
			Handler:           r,
			ReadHeaderTimeout: config.Cfg.ReadHeaderTimeout,
		}

		if err := srv.ListenAndServe(); err != nil {
			log.Printf("Listen error: %s\n", err)
		}
	}
}
