package grpc

import (
	"context"
	"crypto/x509"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/rs/zerolog/log"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
	"github.com/dyrector-io/dyrectorio/golang/internal/version"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"

	"google.golang.org/grpc"
	"google.golang.org/grpc/connectivity"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/keepalive"
	"google.golang.org/grpc/metadata"
)

type GrpcConnection struct {
	Conn   *grpc.ClientConn
	Client agent.AgentClient
}

type GrpcConnectionParams struct {
	nodeID   string
	address  string
	insecure bool
	token    string
}

type (
	DeployFunc     func(context.Context, *dogger.DeploymentLogger, *v1.DeployImageRequest, *v1.VersionData) error
	WatchFunc      func(context.Context, string) []*common.ContainerStateItem
	DeleteFunc     func(context.Context, string, string) error
	SecretListFunc func(context.Context, string, string) ([]string, error)
)

type WorkerFunctions struct {
	Deploy     DeployFunc
	Watch      WatchFunc
	Delete     DeleteFunc
	SecretList SecretListFunc
}

type contextKey int

const contextConfigKey contextKey = 0

func GrpcTokenToConnectionParams(grpcToken *config.ValidJWT, insecureGrpc bool) *GrpcConnectionParams {
	return &GrpcConnectionParams{
		nodeID:   grpcToken.Subject,
		address:  grpcToken.Issuer,
		insecure: insecureGrpc,
		token:    grpcToken.StringifiedToken,
	}
}

func (g *GrpcConnection) SetClient(client agent.AgentClient) {
	g.Client = client
}

func (g *GrpcConnection) SetConn(conn *grpc.ClientConn) {
	g.Conn = conn
}

// Singleton instance
var grpcConn *GrpcConnection

func fetchCertificatesFromURL(ctx context.Context, addr string) (*x509.CertPool, error) {
	log.Print("Retrieving certificate")

	req, err := http.NewRequestWithContext(ctx, http.MethodHead, addr, http.NoBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create the http request: %s", err.Error())
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request for certificates: %s", err.Error())
	}

	defer resp.Body.Close()

	if resp.TLS == nil {
		return nil, errors.New("TLS info is missing")
	}

	if !resp.TLS.HandshakeComplete {
		return nil, errors.New("TLS handshake was incomplete")
	}

	certificates := resp.TLS.PeerCertificates
	if len(certificates) < 1 {
		return nil, errors.New("certificates not found")
	}

	pool := x509.NewCertPool()
	for _, cert := range certificates {
		pool.AddCert(cert)
	}

	return pool, nil
}

func Init(grpcContext context.Context,
	connParams *GrpcConnectionParams,
	appConfig *config.CommonConfiguration,
	workerFuncs WorkerFunctions,
) {
	log.Print("Spinning up gRPC Agent client...")
	if grpcConn == nil {
		grpcConn = &GrpcConnection{}
	}

	ctx, cancel := context.WithCancel(grpcContext)
	ctx = metadata.AppendToOutgoingContext(ctx, "dyo-node-token", connParams.token)

	if grpcConn.Conn == nil {
		var creds credentials.TransportCredentials
		if connParams.insecure {
			creds = insecure.NewCredentials()
		} else {
			httpAddr := fmt.Sprintf("https://%s", connParams.address)
			certPool, err := fetchCertificatesFromURL(ctx, httpAddr)
			if err != nil {
				log.Error().Stack().Err(err).Msg("")
			}

			creds = credentials.NewClientTLSFromCert(certPool, "")
		}

		// TODO: Missing error or panic when the server don't have a secure connection.
		// the application silently dies. Added by @polaroi8d 2020/05/25
		opts := []grpc.DialOption{
			grpc.WithTransportCredentials(creds),
			grpc.WithBlock(),
			grpc.WithKeepaliveParams(
				keepalive.ClientParameters{
					Time:                appConfig.GrpcKeepalive,
					Timeout:             appConfig.DefaultTimeout,
					PermitWithoutStream: true,
				}),
		}

		log.Print("Dialing", connParams.address)
		conn, err := grpc.Dial(connParams.address, opts...)
		if err != nil {
			log.Panic().Stack().Err(err).Msg("failed to dial gRPC")
		}

		for {
			state := conn.GetState()
			if state != connectivity.Ready {
				log.Print("Waiting for state to change: ", state)
				conn.WaitForStateChange(ctx, state)
				log.Print("Changed to: ", conn.GetState())
			} else {
				break
			}
		}
		if err != nil {
			log.Error().Stack().Err(err).Msg("gRPC connection error")
		}
		grpcConn.Conn = conn
	}

	grpcLoop(ctx, connParams.nodeID, workerFuncs, cancel, appConfig)
}

func grpcLoop(
	ctx context.Context,
	nodeID string,
	workerFuncs WorkerFunctions,
	cancel context.CancelFunc, appConfig *config.CommonConfiguration,
) {
	var stream agent.Agent_ConnectClient
	var err error
	defer cancel()
	defer grpcConn.Conn.Close()
	for {
		if grpcConn.Client == nil {
			client := agent.NewAgentClient(grpcConn.Conn)
			grpcConn.SetClient(client)

			publicKey, keyErr := config.GetPublicKey(string(appConfig.SecretPrivateKey))

			if keyErr != nil {
				log.Error().Stack().Err(keyErr).Str("publicKey", publicKey).Msg("grpc public key error")
			}

			stream, err = grpcConn.Client.Connect(
				ctx, &agent.AgentInfo{Id: nodeID, Version: version.BuildVersion(), PublicKey: publicKey},
				grpc.WaitForReady(true),
			)
			if err != nil {
				log.Error().Stack().Err(err).Msg("")
				time.Sleep(time.Second)
				grpcConn.Client = nil
				continue
			} else {
				log.Print("Stream connection is up")
			}
		}

		command := new(agent.AgentCommand)
		err = stream.RecvMsg(command)
		if err == io.EOF {
			log.Print("End of receiving")
			grpcConn.Client = nil
			time.Sleep(appConfig.DefaultTimeout)
			continue
		}
		if err != nil {
			log.Error().Stack().Err(err).Msg("Cannot receive stream")
			grpcConn.Client = nil
			time.Sleep(appConfig.DefaultTimeout)
			// TODO replace the line above with an error status code check and terminate dagent accordingly
			continue
		}

		if command.GetDeploy() != nil {
			go executeVersionDeployRequest(ctx, command.GetDeploy(), workerFuncs.Deploy, appConfig)
		} else if command.GetContainerState() != nil {
			go executeWatchContainerStatus(ctx, command.GetContainerState(), workerFuncs.Watch)
		} else if command.GetContainerDelete() != nil {
			go executeDeleteContainer(ctx, command.GetContainerDelete(), workerFuncs.Delete)
		} else if command.GetDeployLegacy() != nil {
			go executeVersionDeployLegacyRequest(ctx, command.GetDeployLegacy(), workerFuncs.Deploy, appConfig)
		} else if command.GetListSecrets() != nil {
			go executeSecretList(ctx, command.GetListSecrets(), workerFuncs.SecretList, appConfig)
		} else {
			log.Print("Unknown agent command")
		}
	}
}

func executeVersionDeployRequest(
	ctx context.Context, req *agent.VersionDeployRequest,
	deploy DeployFunc, appConfig *config.CommonConfiguration,
) {
	if req.Id == "" {
		log.Print("Empty request")
		return
	}
	log.Print("Deployment -", req.Id, "Opening status channel.")

	deployCtx := metadata.AppendToOutgoingContext(ctx, "dyo-deployment-id", req.Id)
	statusStream, err := grpcConn.Client.DeploymentStatus(deployCtx, grpc.WaitForReady(true))
	if err != nil {
		log.Error().Stack().Err(err).Str("deployment", req.Id).Msg("Status connect error")
		return
	}

	dog := dogger.NewDeploymentLogger(&req.Id, statusStream, ctx, appConfig)

	dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, "Started.")

	if len(req.Requests) < 1 {
		dog.WriteDeploymentStatus(common.DeploymentStatus_PREPARING, "There were no images to deploy.")
		return
	}

	failed := false
	var deployStatus common.DeploymentStatus
	for i := range req.Requests {
		imageReq := mapper.MapDeployImage(req.Requests[i], appConfig)
		dog.SetRequestID(imageReq.RequestID)

		var versionData *v1.VersionData
		if len(req.VersionName) > 0 {
			versionData = &v1.VersionData{Version: req.VersionName, ReleaseNotes: req.ReleaseNotes}
		}

		if err = deploy(ctx, dog, imageReq, versionData); err != nil {
			failed = true
			dog.Write(err.Error())
		}
	}

	if failed {
		deployStatus = common.DeploymentStatus_FAILED
	} else {
		deployStatus = common.DeploymentStatus_SUCCESSFUL
	}

	dog.WriteDeploymentStatus(deployStatus)

	err = statusStream.CloseSend()
	if err != nil {
		log.Error().Stack().Err(err).Str("deployment", req.Id).Msg("Status close err")
		return
	}
}

func executeWatchContainerStatus(ctx context.Context, req *agent.ContainerStateRequest, listFn WatchFunc) {
	filterPrefix := ""
	if req.Prefix != nil {
		filterPrefix = *req.Prefix
	}

	log.Printf("Opening container status channel for prefix: %s", filterPrefix)

	streamCtx := metadata.AppendToOutgoingContext(ctx, "dyo-filter-prefix", filterPrefix)
	stream, err := grpcConn.Client.ContainerState(streamCtx, grpc.WaitForReady(true))
	if err != nil {
		log.Printf("Failed to open container status channel: %s", err.Error())
		return
	}

	for {
		containers := listFn(ctx, filterPrefix)

		err = stream.Send(&common.ContainerStateListMessage{
			Prefix: req.Prefix,
			Data:   containers,
		})

		if err != nil {
			log.Printf("Container status channel error: %s", err.Error())
			break
		}

		if req.OneShot != nil && *req.OneShot {
			if err := stream.CloseSend(); err == nil {
				log.Printf("Closed container status channel for prefix: %s", filterPrefix)
			} else {
				log.Printf("Failed to close container status channel for prefix: %s %v", filterPrefix, err)
			}
			return
		}

		time.Sleep(time.Second)
	}
}

func executeDeleteContainer(ctx context.Context, req *agent.ContainerDeleteRequest, deleteFn DeleteFunc) {
	log.Printf("Deleting container: %s-%s", req.Prefix, req.Name)

	err := deleteFn(ctx, req.Prefix, req.Name)
	if err != nil {
		log.Printf("Failed to delete container: %v", err)
	}
}

func executeVersionDeployLegacyRequest(
	ctx context.Context, req *agent.DeployRequestLegacy,
	deploy DeployFunc, appConfig *config.CommonConfiguration,
) {
	if req.RequestId == "" {
		log.Print("Empty request")
		return
	}
	log.Info().Str("deployment", req.RequestId).Msg("Opening status channel.")

	deployCtx := metadata.AppendToOutgoingContext(ctx, "dyo-deployment-id", req.RequestId)
	statusStream, err := grpcConn.Client.DeploymentStatus(deployCtx, grpc.WaitForReady(true))
	if err != nil {
		log.Error().Stack().Err(err).Str("deployment", req.RequestId).Msg("Status connect error")
		return
	}

	dog := dogger.NewDeploymentLogger(&req.RequestId, statusStream, ctx, appConfig)
	dog.SetRequestID(req.RequestId)

	deployImageRequest := v1.DeployImageRequest{}
	if err = json.Unmarshal([]byte(req.Json), &deployImageRequest); err != nil {
		log.Printf("Failed to parse deploy request JSON! %v", err)

		errorText := fmt.Sprintf("JSON parse error: %v", err)
		dog.WriteDeploymentStatus(common.DeploymentStatus_FAILED, errorText)
		return
	}

	dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, "Started.")

	t1 := time.Now()

	deployStatus := common.DeploymentStatus_SUCCESSFUL
	if err = deploy(ctx, dog, &deployImageRequest, nil); err == nil {
		dog.Write(fmt.Sprintf("Deployment took: %.2f seconds", time.Since(t1).Seconds()))
		dog.Write("Deployment succeeded.")
	} else {
		deployStatus = common.DeploymentStatus_FAILED
		dog.Write("Deployment failed " + err.Error())
	}

	dog.WriteDeploymentStatus(deployStatus)

	err = statusStream.CloseSend()
	if err != nil {
		log.Error().Stack().Err(err).
			Str("deployment", req.RequestId).
			Str("deployImageRequestId", deployImageRequest.RequestID).
			Msg("Status close err")
		return
	}
}

func executeSecretList(
	ctx context.Context,
	command *agent.ListSecretsRequest,
	listFunc SecretListFunc,
	appConfig *config.CommonConfiguration,
) {
	prefix := command.Prefix
	name := command.Name

	log.Printf("Getting secrets for prefix-name: '%s-%s'", prefix, name)

	keys, err := listFunc(ctx, prefix, name)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Secret list error")
		return
	}

	publicKey, err := config.GetPublicKey(string(appConfig.SecretPrivateKey))
	if err != nil {
		log.Error().Stack().Err(err).Msg("Failed to get public key")
		return
	}

	resp := &common.ListSecretsResponse{
		Prefix:    prefix,
		Name:      name,
		PublicKey: publicKey,
		HasKeys:   keys != nil,
		Keys:      keys,
	}

	_, err = grpcConn.Client.SecretList(ctx, resp)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Secret list response error")
		return
	}
}

func WithGRPCConfig(parentContext context.Context, cfg any) context.Context {
	return context.WithValue(parentContext, contextConfigKey, cfg)
}

func GetConfigFromContext(ctx context.Context) any {
	return ctx.Value(contextConfigKey)
}
