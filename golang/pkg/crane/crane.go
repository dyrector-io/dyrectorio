package crane

import (
	"context"
	"os"

	"github.com/rs/zerolog/log"
	"k8s.io/apimachinery/pkg/api/resource"

	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/crux"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/k8s"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
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
	log.Info().Msg("Starting dyrector.io crane service.")

	// TODO(robot9706): Implement updater
	log.Debug().Msg("No update was set up")

	grpcParams := grpc.TokenToConnectionParams(cfg.GrpcToken)
	grpcContext := grpc.WithGRPCConfig(context.Background(), cfg)
	grpc.Init(grpcContext, grpcParams, &cfg.CommonConfiguration, grpc.WorkerFunctions{
		Deploy:           k8s.Deploy,
		Watch:            crux.GetDeployments,
		Delete:           k8s.Delete,
		DeleteContainers: k8s.DeleteMultiple,
		SecretList:       crux.GetSecretsList,
		ContainerLog:     k8s.PodLog,
		Close:            grpcClose,
	})
}

func grpcClose(ctx context.Context, reason agent.CloseReason) error {
	if reason == agent.CloseReason_SHUTDOWN {
		log.Info().Msg("Remote shutdown requested")
		os.Exit(0)
	} else {
		log.Error().Int32("reason", int32(reason)).Msg("Close reason not implemented")
	}

	return nil
}
