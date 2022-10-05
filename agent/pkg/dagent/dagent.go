package dagent

import (
	"context"
	"log"

	"github.com/dyrector-io/dyrectorio/agent/internal/grpc"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/config"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/model"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/update"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/utils"
)

func Serve(cfg *config.Configuration) {
	utils.PreflightChecks(cfg)
	log.Println("Starting dyrector.io DAgent service")

	grpcToken := cfg.GrpcToken
	grpcInsecure := cfg.GrpcInsecure

	if grpcToken == "" {
		log.Panic("no grpc address was provided")
	}

	if cfg.TraefikEnabled {
		params := model.TraefikDeployRequest{
			LogLevel: cfg.TraefikLogLevel,
			TLS:      cfg.TraefikTLS,
			AcmeMail: cfg.TraefikAcmeMail,
			Port:     cfg.TraefikPort,
			TLSPort:  cfg.TraefikTLSPort,
		}

		err := utils.ExecTraefik(context.Background(), params, cfg)
		if err != nil {
			// we wanted to start traefik, but something is not ok, thus panic!
			log.Panic("failed to start Traefik: ", err)
		}
	}

	update.InitUpdater(cfg)

	grpcParams, err := grpc.GrpcTokenToConnectionParams(grpcToken, grpcInsecure)
	if err != nil {
		log.Panic("gRPC token error: ", err)
	}

	grpcContext := grpc.WithGRPCConfig(context.Background(), cfg)
	grpc.Init(grpcContext, grpcParams, &cfg.CommonConfiguration, grpc.WorkerFunctions{
		Deploy:     utils.DeployImage,
		Watch:      utils.GetContainersByNameCrux,
		Delete:     utils.DeleteContainerByName,
		SecretList: utils.SecretList,
	})
}
