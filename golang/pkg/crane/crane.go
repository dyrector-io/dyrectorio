package crane

import (
	"context"

	"github.com/rs/zerolog/log"
	"k8s.io/apimachinery/pkg/api/resource"

	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/crux"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/k8s"
)

// checks before start
// all the runtime dependencies to be checked
func preflightChecks(cfg *config.Configuration) {
	size := cfg.DefaultVolumeSize
	if size != "" {
		_, err := resource.ParseQuantity(size)
		if err != nil {
			log.Panic().Err(err).Stack().Str("DEFAULT_VOLUME_SIZE", size).Msg("Provided env var has errnous value")
		}
	}
}

func Serve(cfg *config.Configuration) {
	preflightChecks(cfg)
	log.Print("Starting dyrector.io crane service.")

	// TODO(robot9706): Implement updater
	log.Print("No update was set up")

	grpcParams := grpc.GrpcTokenToConnectionParams(cfg.GrpcToken)
	grpcContext := grpc.WithGRPCConfig(context.Background(), cfg)
	grpc.Init(grpcContext, grpcParams, &cfg.CommonConfiguration, grpc.WorkerFunctions{
		Deploy:     k8s.Deploy,
		Watch:      crux.GetDeployments,
		Delete:     k8s.Delete,
		SecretList: crux.GetSecretsList,
	})
}
