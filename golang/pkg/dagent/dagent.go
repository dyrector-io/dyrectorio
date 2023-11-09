package dagent

import (
	"context"
	"fmt"

	"github.com/rs/zerolog/log"

	commonConfig "github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/update"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/utils"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
)

func Serve(ctx context.Context, cfg *config.Configuration) error {
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
			log.Panic().Err(err).Msg("Failed to start Traefik")
		}
	}

	publicKey, keyErr := commonConfig.GetPublicKey(cfg.SecretPrivateKey)
	if keyErr != nil {
		return keyErr
	}

	grpcParams := grpc.GetConnectionParams(cfg.JwtToken, publicKey)
	grpcContext := grpc.WithGRPCConfig(ctx, cfg)
	return grpc.StartGrpcClient(grpcContext, grpcParams, &cfg.CommonConfiguration, &grpc.WorkerFunctions{
		Deploy:           utils.DeployImage,
		Watch:            utils.WatchContainers,
		Delete:           utils.DeleteContainerByPrefixAndName,
		SecretList:       utils.SecretList,
		SelfUpdate:       update.SelfUpdate,
		Close:            grpcClose,
		ContainerCommand: utils.ContainerCommand,
		DeleteContainers: utils.DeleteContainers,
		ContainerLog:     utils.ContainerLog,
	}, cfg)
}

func grpcClose(ctx context.Context, reason agent.CloseReason, options grpc.UpdateOptions) error {
	if reason == agent.CloseReason_SELF_DESTRUCT {
		log.Info().Msg("Self destruct")
		err := update.RemoveSelf(ctx, options)
		if err != nil {
			log.Error().Err(err).Msg("error while self-destructing")
		}
	} else if reason == agent.CloseReason_SHUTDOWN {
		log.Info().Msg("Remote shutdown requested")
	}
	return fmt.Errorf("close reason not implemented: %s", agent.CloseReason_name[int32(reason)])
}
