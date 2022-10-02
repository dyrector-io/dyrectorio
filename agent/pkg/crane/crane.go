package crane

import (
	"context"
	"log"

	"k8s.io/apimachinery/pkg/api/resource"

	"github.com/dyrector-io/dyrectorio/agent/internal/grpc"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/crux"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/k8s"
)

// checks before start
// all the runtime dependencies to be checked
func preflightChecks(cfg *config.Configuration) {
	size := cfg.DefaultVolumeSize
	if size != "" {
		_, err := resource.ParseQuantity(size)
		if err != nil {
			log.Panicf("Provided env var %s has errnous value %s\n%s", "DEFAULT_VOLUME_SIZE", size, err.Error())
		}
	}
}

func Serve(cfg *config.Configuration) {
	preflightChecks(cfg)
	log.Println("Starting dyrector.io crane service.")

	grpcToken := cfg.GrpcToken
	grpcInsecure := cfg.GrpcInsecure

	// TODO(robot9706): Implement updater
	log.Println("No update was set up")

	grpcParams, err := grpc.GrpcTokenToConnectionParams(grpcToken, grpcInsecure)
	if err != nil {
		log.Panic("gRPC token error: ", err)
	}

	grpcContext := grpc.WithGRPCConfig(context.Background(), cfg)
	grpc.Init(grpcContext, grpcParams, &cfg.CommonConfiguration, grpc.WorkerFunctions{
		Deploy:     k8s.Deploy,
		Watch:      crux.GetDeployments,
		Delete:     k8s.Delete,
		SecretList: crux.GetSecretsList,
	})
}
