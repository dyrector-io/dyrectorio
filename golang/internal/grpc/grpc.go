package grpc

import (
	"context"
	"crypto/x509"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/rs/zerolog/log"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
	"github.com/dyrector-io/dyrectorio/golang/internal/health"
	"github.com/dyrector-io/dyrectorio/golang/internal/logdefer"
	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
	"github.com/dyrector-io/dyrectorio/golang/internal/version"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/connectivity"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/keepalive"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
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

type ContainerLogEvent struct {
	Message string
	Error   error
}

type ContainerLogReader interface {
	Next() <-chan ContainerLogEvent
	Close() error
}

type ContainerLogContext struct {
	Reader ContainerLogReader
	Echo   bool
}

type ContainerWatchContext struct {
	Events chan []*common.ContainerStateItem
	Error  chan error
}

type UpdateOptions struct {
	UpdateAlways  bool
	UseContainers bool
}

type ClientLoop struct {
	Ctx         context.Context
	WorkerFuncs WorkerFunctions
	Secrets     config.SecretStore
	cancel      context.CancelFunc
	AppConfig   *config.CommonConfiguration
}

type (
	DeployFunc           func(context.Context, *dogger.DeploymentLogger, *v1.DeployImageRequest, *v1.VersionData) error
	WatchFunc            func(context.Context, string) (*ContainerWatchContext, error)
	DeleteFunc           func(context.Context, string, string) error
	SecretListFunc       func(context.Context, string, string) ([]string, error)
	SelfUpdateFunc       func(context.Context, *agent.AgentUpdateRequest, UpdateOptions) error
	CloseFunc            func(context.Context, agent.CloseReason, UpdateOptions) error
	ContainerCommandFunc func(context.Context, *common.ContainerCommandRequest) error
	DeleteContainersFunc func(context.Context, *common.DeleteContainersRequest) error
	ContainerLogFunc     func(context.Context, *agent.ContainerLogRequest) (*ContainerLogContext, error)
	ReplaceTokenFunc     func(context.Context, *agent.ReplaceTokenRequest) error
)

type WorkerFunctions struct {
	Deploy           DeployFunc
	Watch            WatchFunc
	Delete           DeleteFunc
	SecretList       SecretListFunc
	SelfUpdate       SelfUpdateFunc
	Close            CloseFunc
	ContainerCommand ContainerCommandFunc
	DeleteContainers DeleteContainersFunc
	ContainerLog     ContainerLogFunc
}

type contextKey int

const (
	contextConfigKey     contextKey = 0
	contextMetadataToken            = "dyo-node-token"
)

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

	//nolint:bodyclose //closed already
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request for certificates: %s", err.Error())
	}

	defer logdefer.LogDeferredErr(resp.Body.Close, log.Warn(), "error closing http response")

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
	secrets config.SecretStore,
) {
	log.Info().Msg("Spinning up gRPC Agent client...")
	if grpcConn == nil {
		grpcConn = &Connection{}
	}

	ctx, cancel := context.WithCancel(grpcContext)
	loop := ClientLoop{
		cancel:      cancel,
		AppConfig:   appConfig,
		Ctx:         ctx,
		WorkerFuncs: workerFuncs,
		Secrets:     secrets,
	}

	err := health.Serve(loop.Ctx)
	if err != nil {
		log.Warn().Err(err).Msg("Failed to start serving health")
	}

	loop.Ctx = metadata.AppendToOutgoingContext(loop.Ctx, contextMetadataToken, connParams.token)

	if grpcConn.Conn == nil {
		var creds credentials.TransportCredentials

		httpAddr := fmt.Sprintf("https://%s", connParams.address)
		certPool, err := fetchCertificatesFromURL(loop.Ctx, httpAddr)
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
				conn.WaitForStateChange(loop.Ctx, state)
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

	loop.grpcLoop(connParams)
}

func (l *ClientLoop) grpcProcessCommand(command *agent.AgentCommand) {
	switch {
	case command.GetDeploy() != nil:
		go executeVersionDeployRequest(l.Ctx, command.GetDeploy(), l.WorkerFuncs.Deploy, l.AppConfig)
	case command.GetContainerState() != nil:
		go executeWatchContainerState(l.Ctx, command.GetContainerState(), l.WorkerFuncs.Watch)
	case command.GetContainerDelete() != nil:
		go executeDeleteContainer(l.Ctx, command.GetContainerDelete(), l.WorkerFuncs.Delete)
	case command.GetDeployLegacy() != nil:
		go executeVersionDeployLegacyRequest(l.Ctx, command.GetDeployLegacy(), l.WorkerFuncs.Deploy, l.AppConfig)
	case command.GetListSecrets() != nil:
		go executeSecretList(l.Ctx, command.GetListSecrets(), l.WorkerFuncs.SecretList, l.AppConfig)
	case command.GetUpdate() != nil:
		go executeUpdate(l, command.GetUpdate(), l.WorkerFuncs.SelfUpdate)
	case command.GetClose() != nil:
		go l.executeClose(command.GetClose())
	case command.GetContainerCommand() != nil:
		go executeContainerCommand(l.Ctx, command.GetContainerCommand(), l.WorkerFuncs.ContainerCommand)
	case command.GetDeleteContainers() != nil:
		go executeDeleteMultipleContainers(l.Ctx, command.GetDeleteContainers(), l.WorkerFuncs.DeleteContainers)
	case command.GetContainerLog() != nil:
		go executeContainerLog(l.Ctx, command.GetContainerLog(), l.WorkerFuncs.ContainerLog)
	case command.GetReplaceToken() != nil:
		// should be sync?
		l.executeReplaceToken(command.GetReplaceToken())
	default:
		log.Warn().Msg("Unknown agent command")
	}
}

func (l *ClientLoop) grpcLoop(connParams *ConnectionParams) {
	var stream agent.Agent_ConnectClient
	var err error
	defer l.cancel()
	defer grpcConn.Conn.Close()
	for {
		if grpcConn.Client == nil {
			client := agent.NewAgentClient(grpcConn.Conn)
			grpcConn.SetClient(client)

			publicKey, keyErr := config.GetPublicKey(l.AppConfig.SecretPrivateKey)

			if keyErr != nil {
				log.Panic().Stack().Err(keyErr).Str("publicKey", publicKey).Msg("gRPC public key error")
			}

			stream, err = grpcConn.Client.Connect(
				l.Ctx, &agent.AgentInfo{Id: connParams.nodeID, Version: version.BuildVersion(), PublicKey: publicKey},
				grpc.WaitForReady(true),
			)
			if err != nil {
				log.Error().Stack().Err(err).Send()
				time.Sleep(time.Second)
				grpcConn.Client = nil
				continue
			} else {
				log.Info().Msg("Stream connection is up")
				health.SetHealthGRPCStatus(true)
			}
		}

		command := new(agent.AgentCommand)
		err = stream.RecvMsg(command)
		if err != nil {
			s := status.Convert(err)
			if s != nil && (s.Code() == codes.Unauthenticated || s.Code() == codes.PermissionDenied || s.Code() == codes.NotFound) {
				if l.AppConfig.GrpcToken.Type == config.Connection {
					log.Error().Err(err).Msg("Invalid connection token. Removing")

					// overwrite jwt token
					err := l.Secrets.SaveConnectionToken("")
					if err != nil {
						log.Err(err).Msg("Failed to delete the invalid connection token. Exiting")

						os.Exit(1)
						return
					}

				} else {
					log.Error().Err(err).Msg("Invalid install token. Blacklisting nonce")
					err = l.Secrets.BlacklistNonce(l.AppConfig.GrpcToken.Nonce)
					if err != nil {
						log.Error().Err(err).Msg("Failed to blacklist the install token")
					}

					log.Debug().Msg("Exiting")
					os.Exit(1)
					return
				}
			}

			grpcConn.Client = nil
			health.SetHealthGRPCStatus(false)

			if err == io.EOF {
				log.Info().Msg("End of stream")
			} else {
				log.Error().Stack().Err(err).Msg("Cannot receive stream")
				// TODO replace the line above with an error status code check and terminate dagent accordingly
			}

			time.Sleep(l.AppConfig.DefaultTimeout)
			continue
		}

		l.grpcProcessCommand(command)
	}
}

func executeVersionDeployRequest(
	ctx context.Context, req *agent.VersionDeployRequest,
	deploy DeployFunc, appConfig *config.CommonConfiguration,
) {
	if deploy == nil {
		log.Error().Msg("Deploy function not implemented")
		return
	}

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
		log.Error().Stack().Err(err).Str("deployment", req.Id).Msg("Status close error")
		return
	}
}

func streamContainerStatus(
	streamCtx context.Context,
	filterPrefix string,
	stream agent.Agent_ContainerStateClient,
	req *agent.ContainerStateRequest,
	eventsContext *ContainerWatchContext,
) {
	for {
		select {
		case <-streamCtx.Done():
			return
		case eventError := <-eventsContext.Error:
			log.Error().Err(eventError).Msg("Container status watcher error")
			return
		case event := <-eventsContext.Events:
			err := stream.Send(&common.ContainerStateListMessage{
				Prefix: req.Prefix,
				Data:   event,
			})
			if err != nil {
				log.Error().Err(err).Msg("Container status channel error")
				return
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
			break
		}
	}
}

func executeWatchContainerState(ctx context.Context, req *agent.ContainerStateRequest, watchFn WatchFunc) {
	if watchFn == nil {
		log.Error().Msg("Watch function not implemented")
		return
	}

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

	defer func() {
		err = stream.CloseSend()
		if err != nil {
			log.Error().Err(err).Stack().Str("prefix", filterPrefix).Msg("Failed to close container status stream")
		}
	}()

	streamCtx = stream.Context()

	eventsContext, err := watchFn(streamCtx, filterPrefix)
	if err != nil {
		log.Error().Err(err).Str("prefix", filterPrefix).Msg("Failed to open container status reader")
		return
	}

	// The channel consumer must run in a gofunc so RecvMsg can receive server side stream close events
	go streamContainerStatus(streamCtx, filterPrefix, stream, req, eventsContext)

	// RecvMsg must be called in order to get an error if the server closes the stream
	for {
		var msg interface{}
		err := stream.RecvMsg(&msg)
		if err != nil {
			break
		}
	}

	<-streamCtx.Done()

	log.Info().Str("prefix", filterPrefix).Msg("Container status channel closed")
}

func executeDeleteContainer(ctx context.Context, req *agent.ContainerDeleteRequest, deleteFn DeleteFunc) {
	if deleteFn == nil {
		log.Error().Msg("Delete function not implemented")
		return
	}

	log.Info().Str("prefix", req.Prefix).Str("name", req.Name).Msg("Deleting container")

	err := deleteFn(ctx, req.Prefix, req.Name)
	if err != nil {
		log.Error().Err(err).Msg("Failed to delete container")
	}
}

func executeDeleteMultipleContainers(ctx context.Context, req *common.DeleteContainersRequest, deleteFn DeleteContainersFunc) {
	if deleteFn == nil {
		log.Error().Msg("Delete function not implemented")
		return
	}

	log.Info().Msg("Deleting multiple containers")

	err := deleteFn(ctx, req)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Failed to delete multiple containers")
	}
}

func executeVersionDeployLegacyRequest(
	ctx context.Context, req *agent.DeployRequestLegacy,
	deploy DeployFunc, appConfig *config.CommonConfiguration,
) {
	if deploy == nil {
		log.Error().Msg("Deploy function not implemented")
		return
	}

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
	if listFunc == nil {
		log.Error().Msg("Secret list function not implemented")
		return
	}

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

func executeUpdate(loop *ClientLoop, command *agent.AgentUpdateRequest, updateFunc SelfUpdateFunc) {
	if updateFunc == nil {
		log.Error().Msg("Self update function not implemented")
		return
	}

	_, err := config.ValidateAndCreateJWT(command.Token)
	if err != nil {
		log.Error().Msg("Jwt validation failed")

		abortUpdate(loop.Ctx, err)
		return
	}

	err = loop.executeReplaceToken(&agent.ReplaceTokenRequest{
		Token: command.Token,
	})

	if err == nil {
		err = updateFunc(loop.Ctx, command, updateOptionsFromAppConfig(loop.AppConfig))
	}

	if err != nil {
		abortUpdate(loop.Ctx, err)
	}
}

func abortUpdate(ctx context.Context, err error) {
	log.Error().Stack().Err(err).Msg("Update error")

	errorString := err.Error()
	resp := &agent.AgentAbortUpdate{
		Error: strings.ToUpper(errorString[0:1]) + errorString[1:],
	}

	_, err = grpcConn.Client.AbortUpdate(ctx, resp)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Update abort request error")
	}
}

func (l *ClientLoop) executeClose(command *agent.CloseConnectionRequest) {
	closeFunc := l.WorkerFuncs.Close

	if closeFunc == nil {
		log.Error().Msg("Close function not implemented")
		return
	}

	log.Debug().Str("reason", agent.CloseReason_name[int32(command.GetReason())]).Msg("gRPC connection remotely closed")

	if command.Reason == agent.CloseReason_REVOKE_TOKEN {
		err := l.Secrets.SaveConnectionToken("")
		if err != nil {
			log.Error().Err(err).Msg("Failed to delete connection token")
		}
	}

	err := closeFunc(l.Ctx, command.Reason, updateOptionsFromAppConfig(l.AppConfig))
	if err != nil {
		log.Error().Stack().Err(err).Msg("Close handler error")
	}
}

func executeContainerCommand(ctx context.Context, command *common.ContainerCommandRequest, containerCommandFunc ContainerCommandFunc) {
	if containerCommandFunc == nil {
		log.Error().Msg("Container command function not implemented")
		return
	}

	log.Info().
		Str("operation", command.Operation.String()).
		Str("prefix", command.Container.Prefix).
		Str("name", command.Container.Name).
		Msg("Executing")

	err := containerCommandFunc(ctx, command)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Container Command error")
	}
}

func streamContainerLog(reader ContainerLogReader,
	client agent.Agent_ContainerLogClient,
	prefix, name string,
	streaming bool,
	logContext *ContainerLogContext,
) {
	for {
		event := <-reader.Next()
		if event.Error != nil {
			if event.Error == io.EOF && !streaming {
				log.Trace().Str("prefix", prefix).Str("name", name).Msg("Container log finished non streaming (EOF)")
				break
			}

			if event.Error == context.Canceled {
				log.Trace().Str("prefix", prefix).Str("name", name).Msg("Container log finished context cancel (server close)")
				break
			}

			log.Error().Err(event.Error).Stack().Str("prefix", prefix).Str("name", name).Msg("Container log reader error")

			if client.Context().Err() == nil {
				err := client.CloseSend()
				if err != nil {
					log.Error().Err(err).Stack().Str("prefix", prefix).Str("name", name).Msg("Failed to close client")
				}
			}

			break
		}

		if logContext.Echo {
			log.Debug().Str("prefix", prefix).Str("name", name).Str("log", event.Message).Msg("Container log")
		}

		err := client.Send(&common.ContainerLogMessage{
			Log: event.Message,
		})
		if err != nil {
			log.Error().Err(err).Stack().Str("prefix", prefix).Str("name", name).Msg("Container log channel error")
			break
		}
	}
}

func executeContainerLog(ctx context.Context, command *agent.ContainerLogRequest, logFunc ContainerLogFunc) {
	if logFunc == nil {
		log.Error().Msg("Container log function not implemented")
		return
	}

	prefix := command.Container.Prefix
	name := command.Container.Name

	log.Debug().Str("prefix", prefix).Str("name", name).Uint32("tail", command.GetTail()).
		Bool("stream", command.GetStreaming()).Msg("Getting container logs")

	prefixCtx := metadata.AppendToOutgoingContext(ctx, "dyo-container-prefix", prefix)
	streamCtx := metadata.AppendToOutgoingContext(prefixCtx, "dyo-container-name", name)

	stream, err := grpcConn.Client.ContainerLog(streamCtx, grpc.WaitForReady(true))
	if err != nil {
		log.Error().Err(err).Str("prefix", prefix).Str("name", name).Msg("Failed to open container log channel")
		return
	}

	defer func() {
		err = stream.CloseSend()
		if err != nil {
			log.Error().Err(err).Stack().Str("prefix", prefix).Str("name", name).Msg("Failed to close container log stream")
		}
	}()

	streamCtx = stream.Context()

	logContext, err := logFunc(streamCtx, command)
	if err != nil {
		log.Error().Err(err).Str("prefix", prefix).Str("name", name).Msg("Failed to open container log reader")
		return
	}

	reader := logContext.Reader

	defer func() {
		err = reader.Close()
		if err != nil {
			log.Error().Err(err).Str("prefix", prefix).Str("name", name).Msg("Failed to close container log reader")
		}
	}()

	go streamContainerLog(reader, stream, prefix, name, command.GetStreaming(), logContext)

	for {
		var msg interface{}
		err := stream.RecvMsg(&msg)
		if err != nil {
			break
		}
	}

	<-streamCtx.Done()

	log.Trace().Str("prefix", prefix).Str("name", name).Msg("Container log exited")
}

func (l *ClientLoop) executeReplaceToken(command *agent.ReplaceTokenRequest) error {
	log.Debug().Msg("Replace token requested")

	err := l.Secrets.CheckPermissions()
	if err != nil {
		log.Error().Err(err).Msg("Token file permission check failed")
		return err
	}

	_, err = grpcConn.Client.TokenReplaced(l.Ctx, &common.Empty{})
	if err != nil {
		log.Error().Err(err).Msg("Failed to report token replacement, falling back to the old token")
		return err
	}

	err = l.Secrets.SaveConnectionToken(command.GetToken())
	if err != nil {
		// For example, out of space?
		log.Panic().Err(err).Msg("Failed to write the jwt token.")
	}

	md, ok := metadata.FromOutgoingContext(l.Ctx)
	if !ok {
		md = metadata.Pairs(contextMetadataToken, command.GetToken())
	} else {
		md.Set(contextMetadataToken, command.GetToken())
	}

	l.Ctx = metadata.NewOutgoingContext(l.Ctx, md)
	return nil
}

func updateOptionsFromAppConfig(appConfig *config.CommonConfiguration) UpdateOptions {
	if appConfig.Debug {
		return UpdateOptions{
			UpdateAlways:  appConfig.DebugUpdateAlways,
			UseContainers: appConfig.DebugUpdateUseContainers,
		}
	}

	// production
	return UpdateOptions{
		UpdateAlways:  false,
		UseContainers: true,
	}
}

func WithGRPCConfig(parentContext context.Context, cfg any) context.Context {
	return context.WithValue(parentContext, contextConfigKey, cfg)
}

func GetConfigFromContext(ctx context.Context) any {
	return ctx.Value(contextConfigKey)
}
