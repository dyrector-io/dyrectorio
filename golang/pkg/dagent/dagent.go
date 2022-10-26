package dagent

import (
	"context"
	"errors"

	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/update"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/utils"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
)

func Serve(cfg *config.Configuration) {
	utils.PreflightChecks(cfg)
	log.Print("Starting dyrector.io DAgent service")

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

	grpcParams := grpc.TokenToConnectionParams(cfg.GrpcToken, getAgentImageDate())
	grpcContext := grpc.WithGRPCConfig(context.Background(), cfg)
	grpc.Init(grpcContext, grpcParams, &cfg.CommonConfiguration, grpc.WorkerFunctions{
		Deploy:     utils.DeployImage,
		Watch:      utils.GetContainersByName,
		Delete:     utils.DeleteContainerByName,
		SecretList: utils.SecretList,
		Update:     update.SelfUpdate,
		Close:      grpcClose,
	})
}

func getAgentImageDate() string {
	image, err := utils.GetOwnContainerImage()
	if err != nil {
		if errors.Is(err, &utils.UnknownContainerError{}) {
			return "-"
		}

		log.Panic().Err(err).Msg("Failed to get own container")
	}

	return image.Created
}

func grpcClose(ctx context.Context, reason agent.CloseReason) error {
	if reason == agent.CloseReason_SELF_DESTRUCT {
		return update.RemoveSelf(ctx)
	}

	return nil
}
