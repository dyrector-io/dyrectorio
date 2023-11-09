//go:build integration
// +build integration

package grpc_test

import (
	"context"
	"fmt"
	"log"
	"net"
	"testing"
	"time"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
	g "github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc"
)

const (
	serverURI = "localhost:0"
	// for debugging increasing this might help, otherwise this is normally handled in milliseconds
	testTimeout = 60
)

type agentServer struct {
	agent.UnimplementedAgentServer
	address        string
	commandCounter int
	commands       []*agent.AgentCommand
	closeCh        chan any
}

func (s *agentServer) Connect(info *agent.AgentInfo, server agent.Agent_ConnectServer) error {
	log.Printf("agent info: %v", info)
	// send back the command immediately if defined
	for _, cmd := range s.commands {
		if err := server.Send(cmd); err != nil {
			log.Printf("server command send serr: %v", err)
		}
	}

	// wait until close requested
	<-s.closeCh
	log.Printf("close channel received")
	return nil
}

func startServer(commands []*agent.AgentCommand) *agentServer {
	lis, err := net.Listen("tcp", serverURI)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	s := grpc.NewServer()
	agentServer := &agentServer{
		address:  lis.Addr().String(),
		commands: commands,
		closeCh:  make(chan any),
	}

	agent.RegisterAgentServer(s, agentServer)
	log.Printf("mocker server listening at %v", lis.Addr())

	go func() {
		if err := s.Serve(lis); err != nil {
			log.Printf("failed to serve: %v", err)
		}
	}()

	return agentServer
}

func TestGrpcInitNegative(t *testing.T) {
	serv := startServer(nil)

	t.Run("init fail no debug no https", func(t *testing.T) {
		err := g.StartGrpcClient(
			context.Background(),
			g.GetConnectionParams(&config.ValidJWT{Issuer: serv.address, Subject: "test"}, "test"),
			&config.CommonConfiguration{
				// explicit false is very important
				Debug:            false,
				SecretPrivateKey: privateKey,
			},
			&g.WorkerFunctions{}, nil)

		assert.ErrorIs(t, err, g.ErrInvalidRemoteCertificate, "certificate error is expected")
	})

	t.Run("connecting should stop connecting after a while", func(t *testing.T) {
		const nodeID = "init-no-serv-1"
		err := g.StartGrpcClient(
			context.Background(),
			g.GetConnectionParams(&config.ValidJWT{Issuer: "localhost:12", Subject: nodeID}, "test"),
			&config.CommonConfiguration{
				Debug:            true,
				SecretPrivateKey: privateKey,
				DefaultTimeout:   2 * time.Second,
			},
			&g.WorkerFunctions{}, nil)

		assert.ErrorIs(t, err, context.DeadlineExceeded, "deadline exceeded if could not connect to server")
	})
}

func TestClient(t *testing.T) {
	serv := startServer(commands)
	t.Run("connects successfully, disconnects", func(t *testing.T) {
		fnList := []string{}
		err := g.StartGrpcClient(
			context.Background(),
			g.GetConnectionParams(&config.ValidJWT{Issuer: serv.address, Subject: "test"}, "test"),
			&config.CommonConfiguration{
				Debug:            true,
				SecretPrivateKey: privateKey,
				DefaultTimeout:   5 * time.Second,
			},
			&g.WorkerFunctions{
				Deploy: func(ctx context.Context, dl *dogger.DeploymentLogger, dir *v1.DeployImageRequest, vd *v1.VersionData) error {
					fnList = append(fnList, "deploy")
					return nil
				},
				Watch: func(ctx context.Context, s string) (*g.ContainerWatchContext, error) {
					fnList = append(fnList, "watch")
					return nil, nil
				},
				Delete: func(ctx context.Context, s1, s2 string) error {
					fnList = append(fnList, "delete")
					return nil
				},
				SecretList: func(ctx context.Context, s1, s2 string) ([]string, error) {
					fnList = append(fnList, "secretList")
					return nil, nil
				},
				SelfUpdate: func(context.Context, *agent.AgentUpdateRequest, g.UpdateOptions) error {
					fnList = append(fnList, "selfUpdate")
					return nil
				},
				ContainerCommand: func(ctx context.Context, ccr *common.ContainerCommandRequest) error {
					fnList = append(fnList, "containerCommand")
					return nil
				},
				DeleteContainers: func(ctx context.Context, dcr *common.DeleteContainersRequest) error {
					fnList = append(fnList, "deleteContainer")
					return nil
				},
				ContainerLog: func(ctx context.Context, clr *agent.ContainerLogRequest) (*g.ContainerLogContext, error) {
					fnList = append(fnList, "containerLog")
					return &g.ContainerLogContext{}, fmt.Errorf("test")
				},
				Close: func(context.Context, agent.CloseReason, g.UpdateOptions) error {
					fnList = append(fnList, "close")
					return nil
				},
			},
			nil,
		)

		assert.EqualValues(t, []string{
			"deleteContainer", "delete", "deploy",
			"containerLog", "secretList", "containerCommand",
			"watch", "selfUpdate", "close",
		}, fnList, "all the functions walked")
		assert.ErrorIs(t, err, g.ErrServerRequestedClose)
	})
}
