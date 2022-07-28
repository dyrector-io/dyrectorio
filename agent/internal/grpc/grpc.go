package grpc

import (
	"context"
	"crypto/x509"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/form3tech-oss/jwt-go"

	"github.com/dyrector-io/dyrectorio/agent/internal/config"
	"github.com/dyrector-io/dyrectorio/agent/internal/dogger"
	"github.com/dyrector-io/dyrectorio/agent/internal/mapper"
	"github.com/dyrector-io/dyrectorio/agent/internal/version"
	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/crux"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/connectivity"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/keepalive"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
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

type DeployFunc func(context.Context, *dogger.DeploymentLogger, *v1.DeployImageRequest, *v1.VersionData) error
type WatchFunc func(context.Context, string) []*crux.ContainerStatusItem

type WorkerFunctions struct {
	Deploy DeployFunc
	Watch  WatchFunc
}

type contextKey int

const contextConfigKey contextKey = 0

func GrpcTokenToConnectionParams(grpcToken string, insecureGrpc bool) (*GrpcConnectionParams, error) {
	claims := jwt.StandardClaims{}
	token, err := jwt.ParseWithClaims(grpcToken, &claims, nil)
	if token == nil {
		log.Println("Can not parse the gRPC token")
		if err != nil {
			return nil, err
		}
		log.Println("gRPC skipped")
	}

	return &GrpcConnectionParams{
		nodeID:   claims.Subject,
		address:  claims.Issuer,
		insecure: insecureGrpc,
		token:    grpcToken,
	}, nil
}

func (g *GrpcConnection) SetClient(client agent.AgentClient) {
	g.Client = client
}

func (g *GrpcConnection) SetConn(conn *grpc.ClientConn) {
	g.Conn = conn
}

// Singleton instance
var grpcConn *GrpcConnection

func fetchCertificatesFromURL(url string) (*x509.CertPool, error) {
	log.Println("Retrieving certificate")

	req, err := http.NewRequestWithContext(context.TODO(), http.MethodGet, url, http.NoBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create the http request\n%s", err.Error())
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve the certificates\n%s", err.Error())
	}

	defer resp.Body.Close()

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
	workerFuncs WorkerFunctions) {
	log.Println("Spinning up gRPC Agent client...")
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
			certPool, err := fetchCertificatesFromURL(httpAddr)

			if err != nil {
				log.Panic(err.Error())
			}

			creds = credentials.NewClientTLSFromCert(certPool, "")
		}

		// TODO: Missing error or panic when the server don't have a secure connection.
		// the application silently die. Added by @Levi 2020/05/25
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

		log.Println("Dialing", connParams.address)
		conn, err := grpc.Dial(connParams.address, opts...)

		if err != nil {
			log.Panic("Failed to dial gRPC: ", err.Error())
		}

		for {
			state := conn.GetState()
			if state != connectivity.Ready {
				log.Println("Waiting for state to change: ", state)
				conn.WaitForStateChange(ctx, state)
				log.Println("Changed to: ", conn.GetState())
			} else {
				break
			}
		}
		if err != nil {
			log.Println("gRPC connection error: " + err.Error())
		}
		grpcConn.Conn = conn
	}

	// if binding multiple ports, eg http, we have to run stuff in go func
	grpcLoop(ctx, connParams.nodeID, workerFuncs, cancel, appConfig)
}

// grpc message loop for crane, first difference in their grpc communication
func grpcLoop(
	ctx context.Context,
	nodeID string,
	workerFuncs WorkerFunctions,
	cancel context.CancelFunc, appConfig *config.CommonConfiguration) {
	var stream agent.Agent_ConnectClient
	var err error
	defer cancel()
	defer grpcConn.Conn.Close()
	for {
		if grpcConn.Client == nil {
			client := agent.NewAgentClient(grpcConn.Conn)
			grpcConn.SetClient(client)
			stream, err = grpcConn.Client.Connect(
				ctx, &agent.AgentInfo{Id: nodeID, Version: version.BuildVersion()},
				grpc.WaitForReady(true),
			)
			if err != nil {
				log.Println(err)
				time.Sleep(time.Second)
				grpcConn.Client = nil
				continue
			} else {
				log.Println("Stream connection is up")
			}
		}

		command := new(agent.AgentCommand)
		err = stream.RecvMsg(command)
		if err == io.EOF {
			log.Print("End of receiving")
			grpcConn.Client = nil
			continue
		}
		if err != nil {
			log.Println(status.Errorf(codes.Unknown, "Cannot receive stream: %v", err))
			grpcConn.Client = nil
			time.Sleep(appConfig.DefaultTimeout)
			// TODO replace the line above with an error status code check and terminate dagent accordingly
			continue
		}

		if command.GetDeploy() != nil {
			go executeVersionDeployRequest(ctx, command.GetDeploy(), workerFuncs.Deploy, appConfig)
		} else if command.GetContainerStatus() != nil {
			go executeWatchContainerStatus(ctx, command.GetContainerStatus(), workerFuncs.Watch)
		} else {
			log.Println("Unknown agent command")
		}
	}
}

func executeVersionDeployRequest(
	ctx context.Context, req *agent.VersionDeployRequest,
	deploy DeployFunc, appConfig *config.CommonConfiguration) {
	if req.Id == "" {
		log.Println("Empty request")
		return
	}
	log.Println("Deployment -", req.Id, "Opening status channel.")

	deployCtx := metadata.AppendToOutgoingContext(ctx, "dyo-deployment-id", req.Id)
	statusStream, err := grpcConn.Client.DeploymentStatus(deployCtx, grpc.WaitForReady(true))

	if err != nil {
		log.Println("Deployment -", req.Id, "Status connect error: ", err.Error())
		return
	}

	dog := dogger.NewDeploymentLogger(&req.Id, statusStream, ctx, appConfig)

	dog.WriteDeploymentStatus(crux.DeploymentStatus_IN_PROGRESS, "Started.")

	if len(req.Requests) < 1 {
		dog.WriteDeploymentStatus(crux.DeploymentStatus_PREPARING, "There were no images to deploy.")
		return
	}

	var failed = false
	var deployStatus crux.DeploymentStatus
	for i := range req.Requests {
		imageReq := mapper.MapDeployImage(req.Requests[i], appConfig)
		dog.SetRequestID(imageReq.RequestID)

		if err = deploy(ctx, dog, imageReq, &v1.VersionData{Version: req.VersionName, ReleaseNotes: req.ReleaseNotes}); err != nil {
			failed = true
			dog.Write(err.Error())
		}
	}

	if failed {
		deployStatus = crux.DeploymentStatus_FAILED
	} else {
		deployStatus = crux.DeploymentStatus_SUCCESSFUL
	}

	dog.WriteDeploymentStatus(deployStatus)

	err = statusStream.CloseSend()
	if err != nil {
		log.Println(req.Id, "Stream close err: ", err.Error())
		return
	}
}

func executeWatchContainerStatus(ctx context.Context, req *agent.ContainerStatusRequest, listFn WatchFunc) {
	filterPrefix := ""
	if req.Prefix != nil {
		filterPrefix = *req.Prefix
	}

	log.Printf("Opening container status channel for prefix: %s", filterPrefix)

	streamCtx := metadata.AppendToOutgoingContext(ctx, "dyo-filter-prefix", filterPrefix)
	stream, err := grpcConn.Client.ContainerStatus(streamCtx, grpc.WaitForReady(true))
	if err != nil {
		log.Printf("Failed to open container status channel: %s", err.Error())
		return
	}

	for {
		containers := listFn(ctx, filterPrefix)

		err = stream.Send(&crux.ContainerStatusListMessage{
			Prefix: req.Prefix,
			Data:   containers,
		})

		if err != nil {
			log.Printf("Container status channel error: %s", err.Error())
			return
		}

		time.Sleep(time.Second)
	}
}

func WithGRPCConfig(parentContext context.Context, cfg any) context.Context {
	return context.WithValue(parentContext, contextConfigKey, cfg)
}

func GetConfigFromContext(ctx context.Context) any {
	return ctx.Value(contextConfigKey)
}

// TODO(m8): streamline the log appearince with crane
// func PrintDeployRequestStrings(req *agent.DeployRequest) []string {
// 	return append([]string{},
// 		fmt.Sprintf("Deployment target: k8s ~ %v\n", utils.GetEnv("INGRESS_DOMAIN_ROOT", "docker host")),
// 		fmt.Sprintf("Image: %v\n", utils.JoinV(":", req.ImageName, req.Tag)),
// 		fmt.Sprintf("Registry: %v\n", req.Registry),
// 		fmt.Sprintf("Container name: %v\n", utils.JoinV("-", req.InstanceConfig.Prefix, req.ContainerConfig.Name)),
// 		fmt.Sprintf("Exposed ports: %v\n", req.ContainerConfig.Ports),
// 	)
// }

// func (c *AgentClient) Deploy(deployRequest *agent.DeployRequest) (*agent.DeployResponse, error) {
// 	if deployRequest.Id == "" {
// 		return &agent.DeployResponse{Started: false}, fmt.Errorf("empty request")
// 	}
// 	// utils.RemoteLog(&deployRequest.RequestId, PrintDeployRequestStrings(deployRequest)...)
// 	if err := utils.DeployImage(mapDeployImage(deployRequest)); err != nil {
// 		return &agent.DeployResponse{Started: false}, err
// 	}

// 	return &agent.DeployResponse{Started: true}, nil
// }
