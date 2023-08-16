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
	"golang.org/x/sync/errgroup"

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
	"google.golang.org/grpc/backoff"
	"google.golang.org/grpc/connectivity"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/keepalive"
	"google.golang.org/grpc/metadata"
)

const ParallelProcessing = 16

type InfiniteLoop interface {
	Loop(*ClientLoop) error
}

type ClientLoop struct {
	Ctx         context.Context
	WorkerFuncs WorkerFunctions
	Conn        *Connection
	Secrets     config.SecretStore
	AppConfig   *config.CommonConfiguration
	WorkChan    chan *agent.AgentCommand
}

type Connection struct {
	Ctx        context.Context
	GrpcConn   *grpc.ClientConn
	GrpcClient agent.AgentClient
	Cancel     context.CancelCauseFunc
	*ConnectionParams
}

type ConnectionParams struct {
	nodeID    string
	address   string
	token     string
	publicKey string
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

// UpdateOptions options to increase update testability
type UpdateOptions struct {
	// always execute the update, regardless of the actual version
	UpdateAlways bool
	// if false will not restart by itself, only a message printed about the token events
	UseContainers bool
}

type (
	DeployFunc               func(context.Context, *dogger.DeploymentLogger, *v1.DeployImageRequest, *v1.VersionData) error
	WatchFunc                func(context.Context, string) (*ContainerWatchContext, error)
	DeleteFunc               func(context.Context, string, string) error
	SecretListFunc           func(context.Context, string, string) ([]string, error)
	SelfUpdateFunc           func(context.Context, *agent.AgentUpdateRequest, UpdateOptions) error
	GetSelfContainerNameFunc func(context.Context) (string, error)
	CloseFunc                func(context.Context, agent.CloseReason, UpdateOptions) error
	ContainerCommandFunc     func(context.Context, *common.ContainerCommandRequest) error
	DeleteContainersFunc     func(context.Context, *common.DeleteContainersRequest) error
	ContainerLogFunc         func(context.Context, *agent.ContainerLogRequest) (*ContainerLogContext, error)
	ReplaceTokenFunc         func(context.Context, *agent.ReplaceTokenRequest) error
)

type WorkerFunctions struct {
	Deploy               DeployFunc
	Watch                WatchFunc
	Delete               DeleteFunc
	SecretList           SecretListFunc
	SelfUpdate           SelfUpdateFunc
	GetSelfContainerName GetSelfContainerNameFunc
	Close                CloseFunc
	ContainerCommand     ContainerCommandFunc
	DeleteContainers     DeleteContainersFunc
	ContainerLog         ContainerLogFunc
}

type contextKey int

const (
	contextConfigKey        contextKey = 0
	contextMetadataKeyToken            = "dyo-node-token" // #nosec G101
)

const minimumRPCJitterMillis = 100

var (
	ErrInvalidRemoteCertificate = errors.New("could not fetch valid certificate")
	ErrUnkownAgentCommand       = errors.New("unknown agent command")
	ErrNilStreamForLoop         = errors.New("cannot loop nil stream (no-connection)")
	ErrServerRequestedClose     = errors.New("terminate command received")
)

func GetConnectionParams(grpcToken *config.ValidJWT, publicKey string) *ConnectionParams {
	return &ConnectionParams{
		nodeID:    grpcToken.Subject,
		address:   grpcToken.Issuer,
		token:     grpcToken.StringifiedToken,
		publicKey: publicKey,
	}
}

func (g *Connection) SetClient(client agent.AgentClient) {
	g.GrpcClient = client
}

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

func StartGrpcClient(grpcContext context.Context,
	params *ConnectionParams,
	appConfig *config.CommonConfiguration,
	workerFuncs WorkerFunctions,
	secrets config.SecretStore,
) error {
	conn, err := InitGrpcConnection(grpcContext, params, appConfig, workerFuncs)
	if err != nil {
		return err
	}
	defer func() {
		log.Debug().Msg("Terminating gRPC connection")
		if conn.GrpcClient != nil && conn.GrpcConn != nil {
			logdefer.LogDeferredErr(conn.GrpcConn.Close, log.Warn(), "defer: could not close grpc connection")
			conn = nil
		}
	}()

	err = health.Serve(conn.Ctx)
	loopParams := ClientLoop{
		Ctx:         conn.Ctx,
		Conn:        conn,
		WorkerFuncs: workerFuncs,
		AppConfig:   appConfig,
		Secrets:     secrets,
		WorkChan:    make(chan *agent.AgentCommand, ParallelProcessing),
	}

	cmdStream, err := GetCommandStream(conn, &loopParams)
	if err != nil {
		return err
	}
	// client command stream is up
	health.SetHealthGRPCStatus(true)
	errs, _ := errgroup.WithContext(grpcContext)
	errs.Go(func() error {
		return ReceiveLoop(cmdStream, loopParams.WorkChan)
	})

	errs.Go(func() error {
		return ProcessLoop(&loopParams)
	})

	return errs.Wait()
}

func InitGrpcConnection(grpcContext context.Context,
	params *ConnectionParams,
	appConfig *config.CommonConfiguration,
	workerFuncs WorkerFunctions,
) (*Connection, error) {
	log.Info().Msg("Spinning up gRPC Agent client...")
	ctx, cancel := context.WithCancelCause(grpcContext)
	err := health.Serve(ctx)
	if err != nil {
		log.Warn().Err(err).Msg("Failed to start serving health")
	}

	ctx = metadata.AppendToOutgoingContext(ctx, "dyo-node-token", params.token)

	conn := &Connection{
		Ctx:              ctx,
		Cancel:           cancel,
		ConnectionParams: params,
	}

	log.Debug().Msg("Creating new gRPC connection")
	var creds credentials.TransportCredentials

	httpAddr := fmt.Sprintf("https://%s", conn.address)
	certPool, err := fetchCertificatesFromURL(ctx, httpAddr)
	if err != nil {
		if appConfig.Debug {
			log.Warn().Err(err).Msg("Secure mode is disabled in demo/dev environment, falling back to plain-text gRPC")
			creds = insecure.NewCredentials()
		} else {
			return nil, ErrInvalidRemoteCertificate
		}
	} else {
		creds = credentials.NewClientTLSFromCert(certPool, "")
	}

	opts := []grpc.DialOption{
		grpc.WithTransportCredentials(creds),
		grpc.WithBlock(),
		grpc.WithConnectParams(grpc.ConnectParams{
			Backoff: backoff.DefaultConfig,
		}),
		grpc.WithKeepaliveParams(
			keepalive.ClientParameters{
				Time:                appConfig.GrpcKeepalive,
				Timeout:             2 * time.Minute,
				PermitWithoutStream: true,
			}),
	}

	log.Info().Str("address", conn.address).Msg("Dialing to address.")
	// todo: check this cancel function
	dialContext, _ := context.WithTimeout(ctx, appConfig.DefaultTimeout)
	conn.GrpcConn, err = grpc.DialContext(dialContext, conn.address, opts...)
	if err != nil {
		return nil, err
	}

	for {
		state := conn.GrpcConn.GetState()
		if state != connectivity.Ready {
			log.Debug().Msgf("Waiting for state to change: %d", state)
			conn.GrpcConn.WaitForStateChange(ctx, state)
			log.Debug().Msgf("State Changed to: %d", conn.GrpcConn.GetState())
		} else {
			break
		}
	}

	return conn, nil
}

func GetCommandStream(conn *Connection, l *ClientLoop) (agent.Agent_ConnectClient, error) {
	log.Debug().Msg("Spawning new agent client")
	conn.GrpcClient = agent.NewAgentClient(conn.GrpcConn)

	return conn.GrpcClient.Connect(
		l.Ctx, &agent.AgentInfo{Id: conn.nodeID, Version: version.BuildVersion(), PublicKey: conn.publicKey},
		grpc.WaitForReady(true),
	)
}

func ReceiveLoop(stream agent.Agent_ConnectClient, workChan chan *agent.AgentCommand) error {
	if stream == nil {
		return ErrNilStreamForLoop
	}
	log.Debug().Msg("Starting gRPC loop...")
	for {
		command, err := stream.Recv()
		if err != nil {
			health.SetHealthGRPCStatus(false)

			if err == io.EOF {
				log.Info().Msg("End of stream")
				return nil
			} else if err == grpc.ErrServerStopped {
				log.Error().Stack().Err(err).Msg("Cannot receive stream")
			}
			time.Sleep(minimumRPCJitterMillis * time.Millisecond)
		}
		health.SetHealthGRPCStatus(true)
		if command != nil {
			workChan <- command
		}
	}
}

func ProcessLoop(l *ClientLoop) error {
	for {
		ctx := l.Ctx
		conn := l.Conn
		workerFuncs := l.WorkerFuncs
		appConfig := l.AppConfig
		command := <-l.WorkChan
		log.Debug().Msgf("processing agent command: %v", command.String())
		switch {
		case command.GetDeploy() != nil:
			executeVersionDeployRequest(ctx, conn, command.GetDeploy(), workerFuncs.Deploy, appConfig)
		case command.GetContainerState() != nil:
			executeWatchContainerStatus(ctx, conn, command.GetContainerState(), workerFuncs.Watch)
		case command.GetContainerDelete() != nil:
			executeDeleteContainer(ctx, command.GetContainerDelete(), workerFuncs.Delete)
		case command.GetDeployLegacy() != nil:
			executeVersionDeployLegacyRequest(ctx, conn, command.GetDeployLegacy(), workerFuncs.Deploy, appConfig)
		case command.GetListSecrets() != nil:
			executeSecretList(ctx, conn, command.GetListSecrets(), workerFuncs.SecretList, appConfig)
		case command.GetUpdate() != nil:
			executeUpdate(l, command.GetUpdate())
		case command.GetClose() != nil:
			l.executeClose(command.GetClose())
			return ErrServerRequestedClose
		case command.GetContainerCommand() != nil:
			executeContainerCommand(ctx, command.GetContainerCommand(), workerFuncs.ContainerCommand)
		case command.GetDeleteContainers() != nil:
			executeDeleteMultipleContainers(ctx, command.GetDeleteContainers(), workerFuncs.DeleteContainers)
		case command.GetContainerLog() != nil:
			executeContainerLog(ctx, conn, command.GetContainerLog(), workerFuncs.ContainerLog)
		case command.GetReplaceToken() != nil:
			err := l.executeReplaceToken(command.GetReplaceToken())
			if err != nil {
				log.Error().Err(err).Msg("Token replacement failed")
			}
		default:
			log.Warn().Err(ErrUnkownAgentCommand).Msgf("received unknown command in process loop: %v", command)
		}
	}
}

func (cl *ClientLoop) handleGrpcTokenError(err error) {
	if cl.AppConfig.JwtToken.Type == config.Connection {
		log.Error().Err(err).Msg("Invalid connection token. Removing")

		// overwrite JWT token
		err = cl.Secrets.SaveConnectionToken("")
		if err != nil {
			log.Err(err).Msg("Failed to delete the invalid connection token")
		}
	} else {
		log.Error().Err(err).Msg("Invalid install token. Blacklisting nonce")

		err = cl.Secrets.BlacklistNonce(cl.AppConfig.JwtToken.Nonce)
		if err != nil {
			log.Error().Err(err).Msg("Failed to blacklist the install token")
		}
	}
	return
}

func executeVersionDeployRequest(
	ctx context.Context, conn *Connection, req *agent.VersionDeployRequest,
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
	statusStream, err := conn.GrpcClient.DeploymentStatus(deployCtx, grpc.WaitForReady(true))
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
	if req == nil || eventsContext == nil {
		log.Warn().Msg("container watch was requested with empty request or without context")
		return
	}

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

func executeWatchContainerStatus(ctx context.Context, conn *Connection, req *agent.ContainerStateRequest, watchFn WatchFunc) {
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
	stream, err := conn.GrpcClient.ContainerState(streamCtx, grpc.WaitForReady(true))
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
	ctx context.Context, conn *Connection, req *agent.DeployRequestLegacy,
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
	statusStream, err := conn.GrpcClient.DeploymentStatus(deployCtx, grpc.WaitForReady(true))
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
	conn *Connection,
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

	_, err = conn.GrpcClient.SecretList(ctx, resp)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Secret list response error")
		return
	}
}

func executeUpdate(clientLoop *ClientLoop, command *agent.AgentUpdateRequest) {
	if clientLoop.WorkerFuncs.SelfUpdate == nil {
		log.Error().Msg("Self update function not implemented")
		return
	}

	_, err := config.ValidateAndCreateJWT(command.Token)
	if err != nil {
		log.Error().Msg("JWT validation failed")
		abortUpdate(clientLoop, &agent.AgentAbortUpdate{
			Error: ErrStringToResponseFormat(err),
		})
		return
	}

	err = clientLoop.executeReplaceToken(&agent.ReplaceTokenRequest{
		Token: command.Token,
	})

	if err == nil {
		err = clientLoop.WorkerFuncs.SelfUpdate(clientLoop.Ctx, command, updateOptionsFromAppConfig(clientLoop.AppConfig))
	}

	if err != nil {
		errorString := err.Error()
		resp := &agent.AgentAbortUpdate{
			Error: strings.ToUpper(errorString[0:1]) + errorString[1:],
		}
		abortUpdate(clientLoop, resp)
		_, err := clientLoop.Conn.GrpcClient.AbortUpdate(clientLoop.Ctx, resp)
		if err != nil {
			log.Error().Stack().Err(err).Msg("Update abort request error")
		}
	}
}

func ErrStringToResponseFormat(err error) string {
	errorString := err.Error()
	return strings.ToUpper(errorString[0:1]) + errorString[1:]
}

func abortUpdate(loop *ClientLoop, resp *agent.AgentAbortUpdate) {
	_, err := loop.Conn.GrpcClient.AbortUpdate(loop.Ctx, resp)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Update abort request error")
	}
}

func (cl *ClientLoop) executeClose(command *agent.CloseConnectionRequest) {
	closeFunc := cl.WorkerFuncs.Close
	cancel := cl.Conn.Cancel
	var err error
	if closeFunc == nil {
		log.Debug().Str("reason", agent.CloseReason_name[int32(command.GetReason())]).Msg("gRPC connection remotely closed")

		if command.Reason == agent.CloseReason_CLOSE_REASON_UNSPECIFIED {
			log.Error().Msg("close request received, but not closing without a reason")
			return
		}

		err = closeFunc(cl.Ctx, command.Reason, updateOptionsFromAppConfig(cl.AppConfig))
		if err != nil {
			log.Error().Err(err)
		}
	}
	cancel(errors.Join(errors.New(command.Reason.String()), err))
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

func executeContainerLog(ctx context.Context, conn *Connection, command *agent.ContainerLogRequest, logFunc ContainerLogFunc) {
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

	stream, err := conn.GrpcClient.ContainerLog(streamCtx, grpc.WaitForReady(true))
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

func (cl *ClientLoop) executeReplaceToken(command *agent.ReplaceTokenRequest) error {
	log.Debug().Msg("Replace token requested")

	err := cl.Secrets.CheckPermissions()
	if err != nil {
		log.Error().Err(err).Msg("Token file permission check failed")
		return err
	}

	_, err = cl.Conn.GrpcClient.TokenReplaced(cl.Ctx, &common.Empty{})
	if err != nil {
		log.Error().Err(err).Msg("Failed to report token replacement, falling back to the old token")
		return err
	}

	err = cl.Secrets.SaveConnectionToken(command.GetToken())
	if err != nil {
		// NOTE(@m8vago): For example, out of space?
		log.Panic().Err(err).Msg("Failed to write the JWT token.")
	}

	md, ok := metadata.FromOutgoingContext(cl.Ctx)
	if !ok {
		md = metadata.Pairs(contextMetadataKeyToken, command.GetToken())
	} else {
		md.Set(contextMetadataKeyToken, command.GetToken())
	}

	cl.Ctx = metadata.NewOutgoingContext(cl.Ctx, md)
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
