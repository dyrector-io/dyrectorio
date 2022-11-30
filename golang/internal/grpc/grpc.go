package grpc

import (
	"context"
	"crypto/x509"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
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

type Connection struct {
	Conn   *grpc.ClientConn
	Client agent.AgentClient
}

type ConnectionParams struct {
	nodeID  string
	address string
	token   string
}

type (
	DeployFunc     func(context.Context, *dogger.DeploymentLogger, *v1.DeployImageRequest, *v1.VersionData) error
	WatchFunc      func(context.Context, string) []*common.ContainerStateItem
	DeleteFunc     func(context.Context, string, string) error
	SecretListFunc func(context.Context, string, string) ([]string, error)
	SelfUpdateFunc func(context.Context, string, int32) error
	CloseFunc      func(context.Context, agent.CloseReason) error
)

type WorkerFunctions struct {
	Deploy     DeployFunc
	Watch      WatchFunc
	Delete     DeleteFunc
	SecretList SecretListFunc
	SelfUpdate SelfUpdateFunc
	Close      CloseFunc
}

type contextKey int

const contextConfigKey contextKey = 0

func TokenToConnectionParams(grpcToken *config.ValidJWT) *ConnectionParams {
	return &ConnectionParams{
		nodeID:  grpcToken.Subject,
		address: grpcToken.Issuer,
		token:   grpcToken.StringifiedToken,
	}
}

func (g *Connection) SetClient(client agent.AgentClient) {
	g.Client = client
}

func (g *Connection) SetConn(conn *grpc.ClientConn) {
	g.Conn = conn
}

// Singleton instance
var grpcConn *Connection

func fetchCertificatesFromURL(ctx context.Context, addr string) (*x509.CertPool, error) {
	log.Info().Msg("Retrieving certificate")

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
	connParams *ConnectionParams,
	appConfig *config.CommonConfiguration,
	workerFuncs WorkerFunctions,
) {
	log.Info().Msg("Spinning up gRPC Agent client...")
	if grpcConn == nil {
		grpcConn = &Connection{}
	}

	ctx, cancel := context.WithCancel(grpcContext)
	ctx = metadata.AppendToOutgoingContext(ctx, "dyo-node-token", connParams.token)

	if grpcConn.Conn == nil {
		var creds credentials.TransportCredentials

		httpAddr := fmt.Sprintf("https://%s", connParams.address)
		certPool, err := fetchCertificatesFromURL(ctx, httpAddr)
		if err != nil {
			if appConfig.Debug {
				log.Warn().Err(err).Msg("Secure mode is disabled in demo/dev environment, falling back to plain-text gRPC")
				creds = insecure.NewCredentials()
			} else {
				log.Panic().Err(err).Msg("Could not fetch valid certificate")
			}
		} else {
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

		log.Info().Str("address", connParams.address).Msg("Dialing to address.")
		conn, err := grpc.Dial(connParams.address, opts...)
		if err != nil {
			log.Panic().Stack().Err(err).Msg("Failed to dial gRPC")
		}

		for {
			state := conn.GetState()
			if state != connectivity.Ready {
				log.Debug().Msgf("Waiting for state to change: %d", state)
				conn.WaitForStateChange(ctx, state)
				log.Debug().Msgf("State Changed to: %d", conn.GetState())
			} else {
				break
			}
		}
		if err != nil {
			log.Error().Stack().Err(err).Msg("gRPC connection error")
		}
		grpcConn.Conn = conn
	}

	grpcLoop(ctx, connParams, workerFuncs, cancel, appConfig)
}

func grpcProcessCommand(
	ctx context.Context,
	workerFuncs WorkerFunctions,
	command *agent.AgentCommand,
	appConfig *config.CommonConfiguration,
) {
	switch {
	case command.GetDeploy() != nil:
		go executeVersionDeployRequest(ctx, command.GetDeploy(), workerFuncs.Deploy, appConfig)
	case command.GetContainerState() != nil:
		go executeWatchContainerStatus(ctx, command.GetContainerState(), workerFuncs.Watch)
	case command.GetContainerDelete() != nil:
		go executeDeleteContainer(ctx, command.GetContainerDelete(), workerFuncs.Delete)
	case command.GetDeployLegacy() != nil:
		go executeVersionDeployLegacyRequest(ctx, command.GetDeployLegacy(), workerFuncs.Deploy, appConfig)
	case command.GetListSecrets() != nil:
		go executeSecretList(ctx, command.GetListSecrets(), workerFuncs.SecretList, appConfig)
	case command.GetUpdate() != nil:
		go executeUpdate(ctx, command.GetUpdate(), workerFuncs.SelfUpdate)
	case command.GetClose() != nil:
		go executeClose(ctx, command.GetClose(), workerFuncs.Close)
	default:
		log.Warn().Msg("Unknown agent command")
	}
}

func grpcLoop(
	ctx context.Context,
	connParams *ConnectionParams,
	workerFuncs WorkerFunctions,
	cancel context.CancelFunc,
	appConfig *config.CommonConfiguration,
) {
	var stream agent.Agent_ConnectClient
	var err error
	defer cancel()
	defer grpcConn.Conn.Close()
	for {
		if grpcConn.Client == nil {
			client := agent.NewAgentClient(grpcConn.Conn)
			grpcConn.SetClient(client)

			publicKey, keyErr := config.GetPublicKey(appConfig.SecretPrivateKey)

			if keyErr != nil {
				log.Panic().Stack().Err(keyErr).Str("publicKey", publicKey).Msg("gRPC public key error")
			}

			stream, err = grpcConn.Client.Connect(
				ctx, &agent.AgentInfo{Id: connParams.nodeID, Version: version.BuildVersion(), PublicKey: publicKey},
				grpc.WaitForReady(true),
			)
			if err != nil {
				log.Error().Stack().Err(err).Send()
				time.Sleep(time.Second)
				grpcConn.Client = nil
				continue
			} else {
				log.Info().Msg("Stream connection is up")
			}
		}

		command := new(agent.AgentCommand)
		err = stream.RecvMsg(command)
		if err == io.EOF {
			log.Info().Msg("End of stream")
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

		grpcProcessCommand(ctx, workerFuncs, command, appConfig)
	}
}

func executeVersionDeployRequest(
	ctx context.Context, req *agent.VersionDeployRequest,
	deploy DeployFunc, appConfig *config.CommonConfiguration,
) {
	if req.Id == "" {
		log.Warn().Msg("Empty request id for deployment")
		return
	}
	log.Info().Str("deployment", req.Id).Msg("Opening status channel")

	deployCtx := metadata.AppendToOutgoingContext(ctx, "dyo-deployment-id", req.Id)
	statusStream, err := grpcConn.Client.DeploymentStatus(deployCtx, grpc.WaitForReady(true))
	if err != nil {
		log.Error().Stack().Err(err).Str("deployment", req.Id).Msg("Status connect error")
		return
	}

	dog := dogger.NewDeploymentLogger(ctx, &req.Id, statusStream, appConfig)

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

	log.Info().Str("prefix", filterPrefix).Msg("Opening container status channel")

	streamCtx := metadata.AppendToOutgoingContext(ctx, "dyo-filter-prefix", filterPrefix)
	stream, err := grpcConn.Client.ContainerState(streamCtx, grpc.WaitForReady(true))
	if err != nil {
		log.Error().Err(err).Msg("Failed to open container status channel")
		return
	}

	for {
		containers := listFn(ctx, filterPrefix)

		err = stream.Send(&common.ContainerStateListMessage{
			Prefix: req.Prefix,
			Data:   containers,
		})

		if err != nil {
			log.Error().Err(err).Msg("Container status channel error")
			break
		}

		if req.OneShot != nil && *req.OneShot {
			err := stream.CloseSend()
			if err == nil {
				log.Info().Str("prefix", filterPrefix).Msg("Closed container status channel")
			} else {
				log.Error().Err(err).Str("prefix", filterPrefix).Msg("Failed to close container status channel")
			}
			return
		}

		time.Sleep(time.Second)
	}
}

func executeDeleteContainer(ctx context.Context, req *agent.ContainerDeleteRequest, deleteFn DeleteFunc) {
	log.Info().Str("prefix", req.Prefix).Str("name", req.Name).Msg("Deleting container")

	err := deleteFn(ctx, req.Prefix, req.Name)
	if err != nil {
		log.Error().Err(err).Msg("Failed to delete container")
	}
}

func executeVersionDeployLegacyRequest(
	ctx context.Context, req *agent.DeployRequestLegacy,
	deploy DeployFunc, appConfig *config.CommonConfiguration,
) {
	if req.RequestId == "" {
		log.Warn().Msg("Empty request id for legacy deployment")
		return
	}
	log.Info().Str("deployment", req.RequestId).Msg("Opening status channel.")

	deployCtx := metadata.AppendToOutgoingContext(ctx, "dyo-deployment-id", req.RequestId)
	statusStream, err := grpcConn.Client.DeploymentStatus(deployCtx, grpc.WaitForReady(true))
	if err != nil {
		log.Error().Stack().Err(err).Str("deployment", req.RequestId).Msg("Status connect error")
		return
	}

	dog := dogger.NewDeploymentLogger(ctx, &req.RequestId, statusStream, appConfig)
	dog.SetRequestID(req.RequestId)

	deployImageRequest := v1.DeployImageRequest{}
	if err = json.Unmarshal([]byte(req.Json), &deployImageRequest); err != nil {
		log.Error().Err(err).Msg("Failed to parse deploy request JSON!")

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

	log.Info().Str("prefix", prefix).Str("name", name).Msg("Getting secrets")

	keys, err := listFunc(ctx, prefix, name)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Secret list error")
		return
	}

	publicKey, err := config.GetPublicKey(appConfig.SecretPrivateKey)
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

func executeUpdate(ctx context.Context, command *agent.AgentUpdateRequest, updateFunc SelfUpdateFunc) {
	if updateFunc == nil {
		log.Warn().Stack().Msg("gRPC self update is not implemented")
		return
	}

	err := updateFunc(ctx, command.Tag, command.TimeoutSeconds)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Update error")

		errorString := err.Error()
		resp := &agent.AgentAbortUpdate{
			Error: strings.ToUpper(errorString[0:1]) + errorString[1:],
		}

		_, err := grpcConn.Client.AbortUpdate(ctx, resp)
		if err != nil {
			log.Error().Stack().Err(err).Msg("Update error response")
		}
	}
}

func executeClose(ctx context.Context, command *agent.CloseConnection, closeFunc CloseFunc) {
	log.Debug().Str("reason", agent.CloseReason_name[int32(command.GetReason())]).Msg("gRPC connection remotely closed")

	if closeFunc == nil {
		return
	}

	err := closeFunc(ctx, command.Reason)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Close handler error")
	}
}

func WithGRPCConfig(parentContext context.Context, cfg any) context.Context {
	return context.WithValue(parentContext, contextConfigKey, cfg)
}

func GetConfigFromContext(ctx context.Context) any {
	return ctx.Value(contextConfigKey)
}
