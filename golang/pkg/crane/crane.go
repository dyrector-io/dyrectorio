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
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"

	commonConfig "github.com/dyrector-io/dyrectorio/golang/internal/config"
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

func Serve(cfg *config.Configuration, secretStore commonConfig.SecretStore) {
	preflightChecks(cfg)
	log.Info().Msg("Starting dyrector.io crane service.")

	// TODO(robot9706): Implement updater
	log.Debug().Msg("No update was set up")

	grpcContext := grpc.WithGRPCConfig(context.Background(), cfg)
	grpc.Init(grpcContext, &cfg.CommonConfiguration, secretStore, &grpc.WorkerFunctions{
		Deploy:               k8s.Deploy,
		DeploySharedSecrets:  k8s.DeploySharedSecrets,
		WatchContainerStatus: crux.WatchDeploymentsByPrefix,
		Delete:               k8s.Delete,
		ContainerCommand:     crux.DeploymentCommand,
		DeleteContainers:     k8s.DeleteMultiple,
		SecretList:           crux.GetSecretsList,
		ContainerLog:         k8s.PodLog,
		Close:                grpcClose,
	})
}

func grpcClose(ctx context.Context, reason agent.CloseReason, _ grpc.UpdateOptions) error {
	cfg := grpc.GetConfigFromContext(ctx).(*config.Configuration)
	if reason == agent.CloseReason_SHUTDOWN {
		log.Info().Msg("Remote shutdown requested")

		if cfg.CraneInCluster {
			log.Debug().Msg("running in cluster, scaling down to 0")
			err := crux.DeploymentCommand(ctx, &common.ContainerCommandRequest{
				Container: &common.ContainerIdentifier{
					Prefix: cfg.OwnNamespace,
					Name:   cfg.OwnDeployment,
				},
				Operation: common.ContainerOperation_STOP_CONTAINER,
			})
			if err != nil {
				log.Fatal().Err(err).Msgf("error while scaling shutting down own container")
			}
		}
		os.Exit(0)
	}
	log.Error().Int32("reason", int32(reason)).Msg("Close reason not implemented")

	return nil
}
