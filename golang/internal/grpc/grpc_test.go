package grpc_test

import (
	"context"
	"fmt"
	"log"
	"net"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
	g "github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

const privateKey = `-----BEGIN PGP PRIVATE KEY BLOCK-----
Version: GopenPGP 2.4.8
Comment: https://gopenpgp.org

xVgEYvuRIRYJKwYBBAHaRw8BAQdANZa5ngbeG9ckv+QTpzvQfpwrTqWcO7P4aFaU
3ZLGiXcAAP40CvyVv87ZGFReXnn8518Aj6xe7KcXo2fQyPwS80WNnRJrzR9keXJl
Y3RvcmlvIGNyYW5lIDx0ZXN0QHRlc3QudGU+wowEExYIAD4FAmL7kSEJkLydaEs7
sh1/FiEEOsigctXWJpnCKdN4vJ1oSzuyHX8CGwMCHgECGQEDCwkHAhUIAxYAAgIi
AQAAaRMA/RMI8TEyAtu2XYt+gdBjTa4PgClmc3iiQBUzPKUOXbjjAP90SBMXLNMy
S7YsE0i+8u+ScD2Y7dtQh/hV0orK6V+KAMddBGL7kSESCisGAQQBl1UBBQEBB0D7
5KwFgIvRHNaa90udDkrMnLDNIZhg+ETHk1CPBuLKWQMBCgkAAP9ZHqyX3OERdvTQ
sOrTBeCczBYnHz/xFlcT18DCR6b0ABHBwngEGBYIACoFAmL7kSEJkLydaEs7sh1/
FiEEOsigctXWJpnCKdN4vJ1oSzuyHX8CGwwAAHXcAP4gsaX7neas2yWWEGGpPvmw
/Nq75Rh8snJKjyWz+knyKgEA+xXWjm98lp087PMgXcDPkTnPQOX8WxYBaARQKXvh
Dgg=
=RnEi
-----END PGP PRIVATE KEY BLOCK-----`

const (
	serverURI = "localhost:0"
)

type mockAgentServer struct {
	agent.UnimplementedAgentServer
	server    map[string]agent.Agent_ConnectServer
	address   string
	connected map[string]chan any
	closeCh   map[string]chan any
}

func (m *mockAgentServer) Connect(info *agent.AgentInfo, server agent.Agent_ConnectServer) error {
	log.Printf("agent info: %v", info)
	m.server[info.Id] = server
	m.connected[info.Id] <- true
	<-m.closeCh[info.Id]
	log.Printf("close channel received")
	delete(m.server, info.Id)
	return nil
}

func (m *mockAgentServer) triggerCommand(id string, command *agent.AgentCommand) {
	if err := m.server[id].Send(command); err != nil {
		log.Printf("error triggering command: %v on mock: %v", command, err)
	}
}

func startServer() *mockAgentServer {
	lis, err := net.Listen("tcp", serverURI)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	s := grpc.NewServer()
	mockAgentServer := &mockAgentServer{
		closeCh: make(map[string]chan any),
		server:  map[string]agent.Agent_ConnectServer{},
		address: lis.Addr().String(),
	}
	agent.RegisterAgentServer(s, mockAgentServer)
	log.Printf("mocker server listening at %v", lis.Addr())

	go func() {
		if err := s.Serve(lis); err != nil {
			log.Printf("failed to serve: %v", err)
		}
	}()

	return mockAgentServer
}

var commands = []*agent.AgentCommand{
	{
		Command: nil,
	},
	{
		Command: &agent.AgentCommand_Deploy{Deploy: &agent.VersionDeployRequest{
			Id:           "test-01",
			VersionName:  "test",
			ReleaseNotes: "",
			Requests: []*agent.DeployRequest{
				{
					Id: "req-01",
				},
			},
		}},
	},
	{
		Command: &agent.AgentCommand_DeleteContainers{
			DeleteContainers: &common.DeleteContainersRequest{
				Target: &common.DeleteContainersRequest_Container{
					Container: &common.ContainerIdentifier{Prefix: "test-prefix", Name: "test-name"},
				},
			},
		},
	},
	{
		Command: &agent.AgentCommand_ContainerDelete{
			ContainerDelete: &agent.ContainerDeleteRequest{Prefix: "test", Name: "test"},
		},
	},
	{
		Command: &agent.AgentCommand_DeployLegacy{
			DeployLegacy: &agent.DeployRequestLegacy{RequestId: "id", Json: "{}"},
		},
	},
	{
		Command: &agent.AgentCommand_ContainerLog{
			ContainerLog: &agent.ContainerLogRequest{Container: &common.ContainerIdentifier{Prefix: "test", Name: "test"}},
		},
	},
	{
		Command: &agent.AgentCommand_ListSecrets{ListSecrets: &agent.ListSecretsRequest{Prefix: "test", Name: "test"}},
	},
	{
		Command: &agent.AgentCommand_ContainerCommand{
			ContainerCommand: &common.ContainerCommandRequest{
				Container: &common.ContainerIdentifier{Prefix: "test", Name: "test"},
				Operation: common.ContainerOperation_START_CONTAINER,
			},
		},
	},
	{
		Command: &agent.AgentCommand_ContainerState{ContainerState: &agent.ContainerStateRequest{Prefix: nil, OneShot: nil}},
	},
	{
		Command: &agent.AgentCommand_Update{Update: &agent.AgentUpdateRequest{Tag: "test", TimeoutSeconds: 5}},
	},
	{
		Command: &agent.AgentCommand_Close{
			Close: &agent.CloseConnectionRequest{
				Reason: agent.CloseReason_CLOSE,
			},
		},
	},
}

func TestGrpcInit(t *testing.T) {
	mockServ := startServer()
	t.Run("agent command tests", func(t *testing.T) {
		const nodeID = "command-test"
		ctx := context.Background()
		called := make(chan bool)
		// close connection server-side
		cfg := &config.CommonConfiguration{
			Debug:            true,
			SecretPrivateKey: privateKey,
			DefaultTimeout:   100 * time.Millisecond,
		}
		//nolint
		go g.Init(
			ctx,
			g.GetConnectionParams(&config.ValidJWT{Issuer: mockServ.address, Subject: nodeID}, "test"),
			cfg,
			&g.WorkerFunctions{
				Deploy: func(ctx context.Context, dl *dogger.DeploymentLogger, dir *v1.DeployImageRequest, vd *v1.VersionData) error {
					called <- true
					return nil
				},
				Watch: func(ctx context.Context, s string) (*g.ContainerWatchContext, error) {
					called <- true
					return nil, nil
				},
				Delete: func(ctx context.Context, s1, s2 string) error {
					called <- true
					return nil
				},
				SecretList: func(ctx context.Context, s1, s2 string) ([]string, error) {
					called <- true
					return nil, nil
				},
				SelfUpdate: func(context.Context, *agent.AgentUpdateRequest, g.UpdateOptions) error {
					called <- true
					return nil
				},
				ContainerCommand: func(ctx context.Context, ccr *common.ContainerCommandRequest) error {
					called <- true
					return nil
				},
				DeleteContainers: func(ctx context.Context, dcr *common.DeleteContainersRequest) error {
					called <- true
					return nil
				},
				ContainerLog: func(ctx context.Context, clr *agent.ContainerLogRequest) (*g.ContainerLogContext, error) {
					called <- true
					return &g.ContainerLogContext{}, fmt.Errorf("test")
				},
				Close: func(context.Context, agent.CloseReason, g.UpdateOptions) error {
					called <- true
					return nil
				},
			},
			nil,
		)

		log.Printf("waiting for agent connection")
		for i := 0; i < 50; i++ {
			if mockServ.server[nodeID] != nil {
				break
			}
			if i == 49 {
				t.Fatal("timeout after 5 seconds")
			}
			time.Sleep(100 * time.Millisecond)
		}

		// for debugging increasing this might help, otherwise this is normally handled in milliseconds
		const testTimeout = 5

		for _, cmd := range commands {
			mockServ.triggerCommand(nodeID, cmd)
			if cmd.Command != nil {
				select {
				case res := <-called:
					assert.Truef(t, res, "true is received on execution of command: %v", cmd.String())
				case <-time.After(testTimeout * time.Second):
					t.Fatalf("timeout after 5 seconds")
				}
			}
		}
	})
}

func TestGrpcInitNegativeCases(t *testing.T) {
	mockServ := startServer()

	cfg := &config.CommonConfiguration{
		// explicit false is very important
		Debug:            false,
		SecretPrivateKey: privateKey,
	}
	t.Run("init fail no debug no https", func(t *testing.T) {
		const nodeID = "init-test-1"
		err := g.Init(
			context.Background(),
			g.GetConnectionParams(&config.ValidJWT{Issuer: mockServ.address, Subject: nodeID}, "test"),
			cfg,
			&g.WorkerFunctions{},
			nil,
		)

		assert.ErrorIs(t, err, g.ErrInvalidRemoteCertificate, "certificate error is expected")
	})
}

func TestGrpcNoServer(t *testing.T) {
	t.Run("connecting should stop connecting after a while", func(t *testing.T) {
		const nodeID = "init-panic-test-1"
		cfg := &config.CommonConfiguration{
			Debug:            true,
			SecretPrivateKey: privateKey,
			DefaultTimeout:   2 * time.Second,
		}
		err := g.Init(
			context.Background(),
			g.GetConnectionParams(&config.ValidJWT{Issuer: "localhost:0", Subject: nodeID}, "test"),
			cfg,
			&g.WorkerFunctions{},
			nil,
		)

		assert.ErrorIs(t, err, context.DeadlineExceeded, "deadline exceeded if could not connect to server")
	})
}

func TestContextFuncs(t *testing.T) {
	const name = "test-name"

	ctx := g.WithGRPCConfig(context.TODO(), &config.CommonConfiguration{
		Name: name,
	})
	cfg := g.GetConfigFromContext(ctx).(*config.CommonConfiguration)

	assert.Equal(t, name, cfg.Name, "putting values to context should be retrivable")
}
