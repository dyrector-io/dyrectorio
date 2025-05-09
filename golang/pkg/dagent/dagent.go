package dagent

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/update"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/utils"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
)

func Serve(cfg *config.Configuration) error {
	utils.PreflightChecks()
	log.Info().Msg("Starting dyrector.io DAgent service")

	if cfg.TraefikEnabled {
		params := utils.TraefikDeployRequest{
			LogLevel: cfg.TraefikLogLevel,
			TLS:      cfg.TraefikTLS,
			AcmeMail: cfg.TraefikAcmeMail,
			Port:     cfg.TraefikPort,
			TLSPort:  cfg.TraefikTLSPort,
		}

		err := utils.ExecTraefik(context.Background(), params, cfg)
		if err != nil {
			// we wanted to start traefik, but something is not ok, thus panic!
			return errors.Join(err, fmt.Errorf("failed to start Traefik"))
		}
	}

	grpcContext := grpc.WithGRPCConfig(context.Background(), cfg)
	return grpc.Init(grpcContext, &cfg.CommonConfiguration, cfg, &grpc.WorkerFunctions{
		Deploy:               utils.DeployImage,
		DeploySharedSecrets:  utils.DeploySharedSecrets,
		WatchContainerStatus: utils.ContainerStateStream,
		Delete:               utils.DeleteContainerByPrefixAndName,
		SecretList:           utils.SecretList,
		SelfUpdate:           update.SelfUpdate,
		GetSelfContainerName: update.GetSelfContainerName,
		Close:                grpcClose,
		ContainerCommand:     utils.ContainerCommand,
		DeleteContainers:     utils.DeleteContainers,
		ContainerLog:         utils.ContainerLog,
		ContainerInspect:     utils.ContainerInspect,
	})
}

func grpcClose(ctx context.Context, reason agent.CloseReason, options grpc.UpdateOptions) error {
	switch reason {
	case agent.CloseReason_SELF_DESTRUCT:
		return update.RemoveSelf(ctx, options)
	case agent.CloseReason_SHUTDOWN, agent.CloseReason_REVOKE_TOKEN:
		log.Info().Msg("Remote shutdown requested")
		os.Exit(0)
	}

	return nil
}
