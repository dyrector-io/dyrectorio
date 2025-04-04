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
	"github.com/dyrector-io/dyrectorio/golang/internal/backoff"
	internalCommon "github.com/dyrector-io/dyrectorio/golang/internal/common"
	"github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
	"github.com/dyrector-io/dyrectorio/golang/internal/health"
	"github.com/dyrector-io/dyrectorio/golang/internal/logdefer"
	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
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

type ContainerLogEvent struct {
	Error   error
	Message string
}

type ContainerLogReader interface {
	Next() <-chan ContainerLogEvent
	Close() error
}

type ContainerLogStream struct {
	Reader ContainerLogReader
	Echo   bool
}

type ContainerStatusStream struct {
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

type ClientLoop struct {
	Ctx         context.Context
	WorkerFuncs WorkerFunctions
	Secrets     config.SecretStore
	cancel      context.CancelFunc
	AppConfig   *config.CommonConfiguration
	NodeID      string
}

type (
	DeployFunc               func(context.Context, *dogger.DeploymentLogger, *v1.DeployImageRequest, *v1.VersionData) error
	DeploySharedSecretsFunc  func(context.Context, string, map[string]string) error
	WatchContainerStatusFunc func(context.Context, string, bool) (*ContainerStatusStream, error)
	DeleteFunc               func(context.Context, string, string) error
	SecretListFunc           func(context.Context, string, string) ([]string, error)
	SelfUpdateFunc           func(context.Context, *agent.AgentUpdateRequest, UpdateOptions) error
	GetSelfContainerNameFunc func(context.Context) (string, error)
	CloseFunc                func(context.Context, agent.CloseReason, UpdateOptions) error
	ContainerCommandFunc     func(context.Context, *common.ContainerCommandRequest) error
	DeleteContainersFunc     func(context.Context, *common.DeleteContainersRequest) error
	ContainerLogFunc         func(context.Context, *agent.ContainerLogRequest) (*ContainerLogStream, error)
	ContainerInspectFunc     func(context.Context, *agent.ContainerInspectRequest) (string, error)
	ReplaceTokenFunc         func(context.Context, *agent.ReplaceTokenRequest) error
	SendLogFunc              func(string) error
)

type WorkerFunctions struct {
	Deploy               DeployFunc
	DeploySharedSecrets  DeploySharedSecretsFunc
	WatchContainerStatus WatchContainerStatusFunc
	Delete               DeleteFunc
	SecretList           SecretListFunc
	SelfUpdate           SelfUpdateFunc
	GetSelfContainerName GetSelfContainerNameFunc
	Close                CloseFunc
	ContainerCommand     ContainerCommandFunc
	DeleteContainers     DeleteContainersFunc
	ContainerLog         ContainerLogFunc
	ContainerInspect     ContainerInspectFunc
}

type contextKey int

const (
	contextConfigKey        contextKey = 0
	contextMetadataKeyToken            = "dyo-node-token" // #nosec G101
)

var ErrConnectionRefused = errors.New("server refused connection")

type AgentGrpcError struct {
	Context    context.Context
	InnerError error
}

func (e *AgentGrpcError) Error() string {
	return e.InnerError.Error()
}

func agentError(ctx context.Context, err error) *AgentGrpcError {
	if err == nil {
		err = internalCommon.ErrUnknown
	}

	return &AgentGrpcError{
		Context:    ctx,
		InnerError: err,
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

	//nolint:bodyclose
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

func (cl *ClientLoop) grpcProcessCommand(command *agent.AgentCommand) {
	switch {
	case command.GetDeploy() != nil:
		go executeDeployRequest(
			cl.Ctx,
			command.GetDeploy(),
			cl.WorkerFuncs.Deploy,
			cl.WorkerFuncs.DeploySharedSecrets,
			cl.AppConfig,
		)
	case command.GetContainerState() != nil:
		go executeWatchContainerStatus(cl.Ctx, command.GetContainerState(), cl.WorkerFuncs.WatchContainerStatus)
	case command.GetContainerDelete() != nil:
		go executeDeleteContainer(cl.Ctx, command.GetContainerDelete(), cl.WorkerFuncs.Delete)
	case command.GetDeployLegacy() != nil:
		go executeVersionDeployLegacyRequest(cl.Ctx, command.GetDeployLegacy(), cl.WorkerFuncs.Deploy, cl.AppConfig)
	case command.GetListSecrets() != nil:
		go executeCallback(
			mapListSecretsErrorToCommandError,
			executeSecretList(cl.Ctx, command.GetListSecrets(), cl.WorkerFuncs.SecretList, cl.AppConfig),
		)
	case command.GetUpdate() != nil:
		go executeUpdate(cl, command.GetUpdate(), cl.WorkerFuncs.SelfUpdate)
	case command.GetClose() != nil:
		go cl.executeClose(command.GetClose())
	case command.GetContainerCommand() != nil:
		go executeContainerCommand(cl.Ctx, command.GetContainerCommand(), cl.WorkerFuncs.ContainerCommand)
	case command.GetDeleteContainers() != nil:
		go executeCallback(
			mapDeleteContainersErrorToCommandError,
			executeDeleteMultipleContainers(cl.Ctx, command.GetDeleteContainers(), cl.WorkerFuncs.DeleteContainers),
		)
	case command.GetContainerLog() != nil:
		go executeCallback(
			mapContainerLogErrorToCommandError,
			executeContainerLog(cl.Ctx, command.GetContainerLog(), cl.WorkerFuncs.ContainerLog, cl.WorkerFuncs.WatchContainerStatus),
		)
	case command.GetContainerInspect() != nil:
		go executeCallback(
			mapContainerInspectErrorToCommandError,
			executeContainerInspect(cl.Ctx, command.GetContainerInspect(), cl.WorkerFuncs.ContainerInspect),
		)
	case command.GetReplaceToken() != nil:
		// NOTE(@m8vago): should be sync?
		err := cl.executeReplaceToken(command.GetReplaceToken())
		if err != nil {
			log.Error().Err(err).Msg("Token replacement failed")
		}
	default:
		log.Warn().Msg("Unknown agent command")
	}
}

func statusCodeOf(err *AgentGrpcError) codes.Code {
	if errors.Is(err.InnerError, internalCommon.ErrContainerNotFound) {
		return codes.NotFound
	}

	return codes.Internal
}

func executeCallback(mapError func(*agent.AgentError) *agent.AgentCommandError, grpcErr *AgentGrpcError) {
	if grpcErr == nil {
		return
	}

	statusCode, err := util.SafeUInt32ToInt32(uint32(statusCodeOf(grpcErr)))
	if err != nil {
		log.Error().Err(err).Msg("integer overflow for statusCode")
	}

	agentError := agent.AgentError{
		Status: statusCode,
		Error:  grpcErr.Error(),
	}

	cmdErr := mapError(&agentError)

	_, err = grpcConn.Client.CommandError(grpcErr.Context, cmdErr)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Reporting callback error failed")
	}
}

func (cl *ClientLoop) grpcLoop(token *config.ValidJWT) error {
	var stream agent.Agent_ConnectClient
	var err error
	backoff := backoff.New(time.Minute)
	defer cl.cancel()
	defer func() {
		err = grpcConn.Conn.Close()
		if err != nil {
			log.Error().Err(err).Msg("Failed to close gRPC connection")
		}

		grpcConn.Conn = nil
		grpcConn.Client = nil
	}()
	for {
		if grpcConn.Client == nil {
			backoff.Wait(cl.Ctx)
			client := agent.NewAgentClient(grpcConn.Conn)
			grpcConn.SetClient(client)

			publicKey, keyErr := config.GetPublicKey(cl.AppConfig.SecretPrivateKey)

			if keyErr != nil {
				return errors.Join(keyErr, fmt.Errorf("gRPC public key error, key: %s", publicKey))
			}

			containerName := ""
			if cl.WorkerFuncs.GetSelfContainerName != nil {
				containerName, err = cl.WorkerFuncs.GetSelfContainerName(cl.Ctx)
				if err != nil {
					log.Error().Err(err).Msg("Failed to get the agent's container name")
				}
			}

			stream, err = grpcConn.Client.Connect(
				cl.Ctx, &agent.AgentInfo{Id: cl.NodeID, Version: version.BuildVersion(), PublicKey: publicKey, ContainerName: &containerName},
				grpc.WaitForReady(true),
			)
			if err != nil {
				log.Error().Stack().Err(err).Send()
				time.Sleep(time.Second)
				grpcConn.Client = nil
				continue
			}
			log.Info().Msg("Stream connection is up")
			health.SetHealthGRPCStatus(true)
		}

		command := new(agent.AgentCommand)
		err = stream.RecvMsg(command)
		if err != nil {
			s := status.Convert(err)
			if s != nil && (s.Code() == codes.Unauthenticated || s.Code() == codes.PermissionDenied || s.Code() == codes.NotFound) {
				cl.handleGrpcTokenError(err, token)
				return ErrConnectionRefused
			}

			grpcConn.Client = nil
			health.SetHealthGRPCStatus(false)

			if err == io.EOF {
				log.Info().Msg("End of stream")
			} else {
				log.Error().Stack().Err(err).Msg("Cannot receive stream")
				// TODO replace the line above with an error status code check and terminate dagent accordingly
			}

			time.Sleep(cl.AppConfig.DefaultTimeout)
			continue
		}

		cl.grpcProcessCommand(command)
	}
}

func initWithToken(
	grpcContext context.Context,
	appConfig *config.CommonConfiguration,
	workerFuncs *WorkerFunctions,
	secrets config.SecretStore,
	token *config.ValidJWT,
) error {
	address := token.Issuer

	ctx, cancel := context.WithCancel(grpcContext)
	loop := ClientLoop{
		cancel:      cancel,
		AppConfig:   appConfig,
		Ctx:         ctx,
		WorkerFuncs: *workerFuncs,
		Secrets:     secrets,
		NodeID:      token.Subject,
	}

	loop.Ctx = metadata.AppendToOutgoingContext(loop.Ctx, contextMetadataKeyToken, token.StringifiedToken)

	var creds credentials.TransportCredentials

	httpAddr := fmt.Sprintf("https://%s", address)
	certPool, err := fetchCertificatesFromURL(loop.Ctx, httpAddr)
	if err != nil {
		if appConfig.Debug {
			log.Warn().Err(err).Msg("Secure mode is disabled in demo/dev environment, falling back to plain-text gRPC")
			creds = insecure.NewCredentials()
		} else {
			return errors.Join(err, fmt.Errorf("could not fetch valid certificate"))
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

	log.Info().Str("address", address).Msg("Dialing to address.")
	conn, err := grpc.NewClient(address, opts...)
	if err != nil {
		return err
	}

	for {
		state := conn.GetState()
		if state == connectivity.Ready || state == connectivity.Idle {
			break
		}
		log.Debug().Msgf("Waiting for state to change: %s", state.String())
		conn.WaitForStateChange(loop.Ctx, state)
		log.Debug().Msgf("State Changed to: %d", conn.GetState())
	}
	grpcConn.Conn = conn
	return loop.grpcLoop(token)
}

func Init(grpcContext context.Context,
	appConfig *config.CommonConfiguration,
	secrets config.SecretStore,
	workerFuncs *WorkerFunctions,
) error {
	log.Info().Msg("Spinning up gRPC Agent client...")
	if grpcConn == nil {
		grpcConn = &Connection{}
	}

	healthContext, cancel := context.WithCancel(grpcContext)
	defer cancel()

	err := health.Serve(healthContext)
	if err != nil {
		log.Warn().Err(err).Msg("Failed to start serving health")
	}

	err = initWithToken(grpcContext, appConfig, workerFuncs, secrets, appConfig.JwtToken)
	// intentional check no errors => no fallback
	if err == nil {
		return nil
	}

	if !errors.Is(err, ErrConnectionRefused) {
		return errors.Join(err, fmt.Errorf("connection refused"))
	}

	if appConfig.FallbackJwtToken == nil {
		return nil
	}

	log.Warn().Msg("Connection failed, trying fallback token")

	err = initWithToken(grpcContext, appConfig, workerFuncs, secrets, appConfig.FallbackJwtToken)
	if err != nil {
		return errors.Join(err, fmt.Errorf("connection refused with fallback token"))
	}

	return nil
}

func (cl *ClientLoop) handleGrpcTokenError(err error, token *config.ValidJWT) {
	if token.Type == config.Connection {
		log.Error().Err(err).Msg("Invalid connection token. Removing")

		// overwrite JWT token
		err = cl.Secrets.SaveConnectionToken("")
		if err != nil {
			log.Err(err).Msg("Failed to delete the invalid connection token")
		}
	} else {
		log.Error().Err(err).Msg("Invalid install token. Blacklisting nonce")

		err = cl.Secrets.BlacklistNonce(token.Nonce)
		if err != nil {
			log.Error().Err(err).Msg("Failed to blacklist the install token")
		}
	}
}

func executeDeployRequest(
	ctx context.Context, req *agent.DeployRequest,
	deploy DeployFunc, deploySecrets DeploySharedSecretsFunc, appConfig *config.CommonConfiguration,
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

	deployStatus := common.DeploymentStatus_FAILED
	defer func() {
		dog.WriteDeploymentStatus(deployStatus)

		err = statusStream.CloseSend()
		if err != nil {
			log.Error().Stack().Err(err).Str("deployment", req.Id).Msg("Status close error")
		}
	}()

	if len(req.Secrets) > 0 {
		dog.WriteInfo("Deploying secrets")
		err = deploySecrets(ctx, req.Prefix, req.Secrets)
		if err != nil {
			dog.WriteError(err.Error())
			return
		}
	}

	for i := range req.Requests {
		imageReq := mapper.MapDeployImage(req.Prefix, req.Requests[i], appConfig)
		dog.SetRequestID(imageReq.RequestID)

		var versionData *v1.VersionData
		if req.VersionName != "" {
			versionData = &v1.VersionData{Version: req.VersionName, ReleaseNotes: req.ReleaseNotes}
		}

		if err = deploy(ctx, dog, imageReq, versionData); err != nil {
			dog.WriteError(err.Error())
			return
		}
	}

	deployStatus = common.DeploymentStatus_SUCCESSFUL
}

func streamContainerStatus(
	streamCtx context.Context,
	filterPrefix string,
	stream agent.Agent_ContainerStateClient,
	req *agent.ContainerStateRequest,
	eventsContext *ContainerStatusStream,
) {
	for {
		select {
		case <-streamCtx.Done():
			return
		case eventError := <-eventsContext.Error:
			log.Error().Err(eventError).Msg("Container status stream error")
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
		}
	}
}

func executeWatchContainerStatus(ctx context.Context, req *agent.ContainerStateRequest, containerStatusFn WatchContainerStatusFunc) {
	if containerStatusFn == nil {
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

	eventsContext, err := containerStatusFn(streamCtx, filterPrefix, true)
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

func mapDeleteContainersErrorToCommandError(err *agent.AgentError) *agent.AgentCommandError {
	return &agent.AgentCommandError{
		Command: &agent.AgentCommandError_DeleteContainers{
			DeleteContainers: err,
		},
	}
}

func executeDeleteMultipleContainers(
	ctx context.Context,
	req *common.DeleteContainersRequest,
	deleteFn DeleteContainersFunc,
) *AgentGrpcError {
	prefix, name, err := mapper.MapContainerOrPrefixToPrefixName(req.Target)
	if err != nil {
		log.Error().Err(err).Msg("Failed to delete multiple containers")
		return agentError(ctx, err)
	}

	ctx = metadata.AppendToOutgoingContext(ctx, "dyo-container-prefix", prefix, "dyo-container-name", name)

	if deleteFn == nil {
		return agentError(ctx, internalCommon.ErrMethodNotImplemented)
	}

	log.Info().Msg("Deleting multiple containers")

	err = deleteFn(ctx, req)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Failed to delete multiple containers")
		return agentError(ctx, err)
	}

	_, err = grpcConn.Client.DeleteContainers(ctx, &common.Empty{})
	if err != nil {
		log.Error().Stack().Err(err).Msg("Delete multiple containers response error")
		return nil
	}

	return nil
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
		dog.WriteInfo(fmt.Sprintf("Deployment took: %.2f seconds", time.Since(t1).Seconds()))
		dog.WriteInfo("Deployment succeeded.")
	} else {
		deployStatus = common.DeploymentStatus_FAILED
		dog.WriteError(fmt.Sprintf("Deployment failed %s", err.Error()))
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

func mapListSecretsErrorToCommandError(err *agent.AgentError) *agent.AgentCommandError {
	return &agent.AgentCommandError{
		Command: &agent.AgentCommandError_ListSecrets{
			ListSecrets: err,
		},
	}
}

func executeSecretList(
	ctx context.Context,
	command *agent.ListSecretsRequest,
	listFunc SecretListFunc,
	appConfig *config.CommonConfiguration,
) *AgentGrpcError {
	var prefix string
	name := ""

	if command.Target.GetContainer() != nil {
		prefix = command.Target.GetContainer().Prefix
		name = command.Target.GetContainer().Name
	} else {
		prefix = command.Target.GetPrefix()
	}

	ctx = metadata.AppendToOutgoingContext(ctx, "dyo-container-prefix", prefix, "dyo-container-name", name)

	if listFunc == nil {
		return agentError(ctx, internalCommon.ErrMethodNotImplemented)
	}

	log.Info().Str("prefix", prefix).Str("name", name).Msg("Getting secrets")

	keys, err := listFunc(ctx, prefix, name)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Secret list error")
		return agentError(ctx, err)
	}

	publicKey, err := config.GetPublicKey(appConfig.SecretPrivateKey)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Failed to get public key")
		return agentError(ctx, err)
	}

	resp := &common.ListSecretsResponse{
		Target:    command.Target,
		PublicKey: publicKey,
		Keys:      keys,
	}

	_, err = grpcConn.Client.SecretList(ctx, resp)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Secret list response error")
		return nil
	}

	return nil
}

func executeUpdate(loop *ClientLoop, command *agent.AgentUpdateRequest, updateFunc SelfUpdateFunc) {
	if updateFunc == nil {
		log.Error().Msg("Self update function not implemented")
		return
	}

	_, err := config.ValidateAndCreateJWT(command.Token)
	if err != nil {
		log.Error().Msg("JWT validation failed")

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

func (cl *ClientLoop) executeClose(command *agent.CloseConnectionRequest) {
	closeFunc := cl.WorkerFuncs.Close

	if closeFunc == nil {
		log.Error().Msg("Close function not implemented")
		return
	}

	log.Debug().Str("reason", agent.CloseReason_name[int32(command.GetReason())]).Msg("gRPC connection remotely closed")

	if command.Reason == agent.CloseReason_REVOKE_TOKEN {
		err := cl.Secrets.SaveConnectionToken("")
		if err != nil {
			log.Error().Err(err).Msg("Failed to delete connection token")
		}
	}

	err := closeFunc(cl.Ctx, command.Reason, updateOptionsFromAppConfig(cl.AppConfig))
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

func readContainerLog(logContext *ContainerLogStream, sendLog SendLogFunc, prefix, name string) error {
	reader := logContext.Reader

	defer func() {
		err := reader.Close()
		if err != nil {
			log.Error().Err(err).Str("prefix", prefix).Str("name", name).Msg("Failed to close container log reader")
		}
	}()

	for {
		event := <-reader.Next()
		if event.Error != nil {
			if event.Error == io.EOF {
				return event.Error
			}

			if event.Error == context.Canceled {
				log.Trace().Str("prefix", prefix).Str("name", name).Msg("Container log finished context cancel (server close)")
				break
			}

			return event.Error
		}

		if logContext.Echo {
			log.Trace().Str("prefix", prefix).Str("name", name).Str("log", event.Message).Msg("Container log")
		}

		err := sendLog(event.Message)
		if err != nil {
			log.Error().Err(err).Stack().Str("prefix", prefix).Str("name", name).Msg("Container log channel error")
			return err
		}
	}

	return nil
}

func waitForContainerStatus(ctx context.Context,
	containerStatusFn WatchContainerStatusFunc,
	prefix, name string,
	containerStatus common.ContainerState,
) error {
	eventsContext, err := containerStatusFn(ctx, prefix, false)
	if err != nil {
		log.Error().Err(err).Str("prefix", prefix).Msg("Failed to open container status reader")
		return err
	}

	for {
		select {
		case <-ctx.Done():
			return nil
		case err = <-eventsContext.Error:
			log.Error().Err(err).Msg("Container status stream error, while streaming the container log")
			return err
		case events := <-eventsContext.Events:
			for _, ev := range events {
				if ev.Id.Prefix != prefix || ev.Id.Name != name {
					continue
				}

				if ev.State == containerStatus {
					return nil
				}
			}
		}
	}
}

func streamContainerLog(
	streamCtx context.Context,
	logFunc ContainerLogFunc,
	client agent.Agent_ContainerLogStreamClient,
	containerStatusFn WatchContainerStatusFunc,
	command *agent.ContainerLogRequest,
) {
	prefix := command.Container.Prefix
	name := command.Container.Name

	message := common.ContainerLogMessage{}

	for {
		logContext, err := logFunc(streamCtx, command)
		if err != nil {
			log.Error().Err(err).Str("prefix", prefix).Str("name", name).Msg("Failed to open container log reader")
			return
		}

		err = readContainerLog(logContext, func(log string) error {
			message.Log = log
			return client.Send(&message)
		}, prefix, name)
		if err == nil {
			return
		}

		if err != io.EOF {
			log.Error().Err(err).Stack().Str("prefix", prefix).Str("name", name).Msg("Container log reader error")
			break
		}

		log.Trace().Str("prefix", prefix).Str("name", name).Msg("Container log finished non streaming (EOF), waiting for running status")

		err = waitForContainerStatus(streamCtx, containerStatusFn, prefix, name, common.ContainerState_RUNNING)
		if err != nil {
			log.Error().Err(err).Stack().Str("prefix", prefix).Str("name", name).Msg("Container status stream error")
			break
		}
	}

	if client.Context().Err() == nil {
		err := client.CloseSend()
		if err != nil {
			log.Error().Err(err).Stack().Str("prefix", prefix).Str("name", name).Msg("Failed to close container log stream")
		}
	}
}

func executeContainerLogStream(streamCtx context.Context,
	logFunc ContainerLogFunc,
	statusFunc WatchContainerStatusFunc,
	command *agent.ContainerLogRequest,
) {
	prefix := command.Container.Prefix
	name := command.Container.Name

	stream, err := grpcConn.Client.ContainerLogStream(streamCtx, grpc.WaitForReady(true))
	if err != nil {
		log.Error().Err(err).Str("prefix", prefix).Str("name", name).Msg("Failed to open container log stream")
		return
	}

	defer func() {
		err = stream.CloseSend()
		if err != nil {
			log.Error().Err(err).Stack().Str("prefix", prefix).Str("name", name).Msg("Failed to close container log stream")
		}
	}()

	streamCtx = stream.Context()

	go streamContainerLog(streamCtx, logFunc, stream, statusFunc, command)

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

func collectContainerLog(
	logContext *ContainerLogStream,
	prefix, name string,
) []string {
	containerLog := make([]string, 0)

	err := readContainerLog(logContext, func(log string) error {
		containerLog = append(containerLog, log)
		return nil
	}, prefix, name)
	if err != nil && err != io.EOF {
		log.Error().Err(err).Stack().Str("prefix", prefix).Str("name", name).Msg("Container log reader error")
		return nil
	}

	log.Trace().Str("prefix", prefix).Str("name", name).Msg("Container log finished non streaming (EOF)")

	return containerLog
}

func executeContainerLogRequest(ctx context.Context, logFunc ContainerLogFunc, command *agent.ContainerLogRequest) *AgentGrpcError {
	prefix := command.Container.Prefix
	name := command.Container.Name

	logContext, err := logFunc(ctx, command)
	if err != nil {
		log.Error().Err(err).Str("prefix", prefix).Str("name", name).Send()
		return agentError(ctx, err)
	}

	logs := collectContainerLog(logContext, prefix, name)

	_, err = grpcConn.Client.ContainerLog(ctx, &common.ContainerLogListResponse{
		Logs: logs,
	})
	if err != nil {
		log.Error().Err(err).Str("prefix", prefix).Str("name", name).Msg("Failed to send container logs")
		return nil
	}

	log.Trace().Str("prefix", prefix).Str("name", name).Msg("Container log sent")
	return nil
}

func mapContainerLogErrorToCommandError(err *agent.AgentError) *agent.AgentCommandError {
	return &agent.AgentCommandError{
		Command: &agent.AgentCommandError_ContainerLog{
			ContainerLog: err,
		},
	}
}

func executeContainerLog(
	ctx context.Context,
	command *agent.ContainerLogRequest,
	logFunc ContainerLogFunc,
	statusFunc WatchContainerStatusFunc,
) *AgentGrpcError {
	prefix := command.Container.Prefix
	name := command.Container.Name

	ctx = metadata.AppendToOutgoingContext(ctx, "dyo-container-prefix", prefix, "dyo-container-name", name)

	if logFunc == nil {
		return agentError(ctx, internalCommon.ErrMethodNotImplemented)
	}

	log.Debug().Str("prefix", prefix).Str("name", name).Uint32("tail", command.GetTail()).
		Bool("stream", command.GetStreaming()).Msg("Getting container logs")

	if !command.Streaming {
		return executeContainerLogRequest(ctx, logFunc, command)
	}

	go executeContainerLogStream(ctx, logFunc, statusFunc, command)
	return nil
}

func mapContainerInspectErrorToCommandError(err *agent.AgentError) *agent.AgentCommandError {
	return &agent.AgentCommandError{
		Command: &agent.AgentCommandError_ContainerInspect{
			ContainerInspect: err,
		},
	}
}

func executeContainerInspect(
	ctx context.Context,
	command *agent.ContainerInspectRequest,
	inspectFunc ContainerInspectFunc,
) *AgentGrpcError {
	prefix := command.Container.Prefix
	name := command.Container.Name

	ctx = metadata.AppendToOutgoingContext(ctx, "dyo-container-prefix", prefix, "dyo-container-name", name)

	if inspectFunc == nil {
		log.Error().Msg("Container inspect function not implemented")
		return agentError(ctx, internalCommon.ErrMethodNotImplemented)
	}

	log.Info().Str("prefix", prefix).Str("name", name).Msg("Getting container inspection")

	data, err := inspectFunc(ctx, command)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Failed to inspect container")
		return agentError(ctx, err)
	}

	resp := &common.ContainerInspectResponse{
		Data: data,
	}

	_, err = grpcConn.Client.ContainerInspect(ctx, resp)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Container inspection response error")
		return nil
	}

	return nil
}

func (cl *ClientLoop) executeReplaceToken(command *agent.ReplaceTokenRequest) error {
	log.Debug().Msg("Replace token requested")

	err := cl.Secrets.CheckPermissions()
	if err != nil {
		log.Error().Err(err).Msg("Token file permission check failed")
		return err
	}

	_, err = grpcConn.Client.TokenReplaced(cl.Ctx, &common.Empty{})
	if err != nil {
		log.Error().Err(err).Msg("Failed to report token replacement, falling back to the old token")
		return err
	}

	err = cl.Secrets.SaveConnectionToken(command.GetToken())
	if err != nil {
		// NOTE(@m8vago): For example, out of space?
		return errors.Join(err, fmt.Errorf("failed to write the JWT token"))
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
