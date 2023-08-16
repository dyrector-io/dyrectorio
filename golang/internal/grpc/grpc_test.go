//go:build unit
// +build unit

package grpc_test

import (
	"context"
	"fmt"
	"testing"
	"time"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
	g "github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/internal/grpc/mock_agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
	"golang.org/x/sync/errgroup"
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

func getWorkerFuncs(funcs []string) g.WorkerFunctions {
	return g.WorkerFunctions{
		Deploy: func(ctx context.Context, dl *dogger.DeploymentLogger, dir *v1.DeployImageRequest, vd *v1.VersionData) error {
			funcs = append(funcs, "deploy")
			return nil
		},
		Watch: func(ctx context.Context, s string) (*g.ContainerWatchContext, error) {
			funcs = append(funcs, "watch")
			return nil, nil
		},
		Delete: func(ctx context.Context, s1, s2 string) error {
			funcs = append(funcs, "delete")
			return nil
		},
		SecretList: func(ctx context.Context, s1, s2 string) ([]string, error) {
			funcs = append(funcs, "secretList")
			return nil, nil
		},
		SelfUpdate: func(context.Context, *agent.AgentUpdateRequest, g.UpdateOptions) error {
			funcs = append(funcs, "selfUpdate")
			return nil
		},
		ContainerCommand: func(ctx context.Context, ccr *common.ContainerCommandRequest) error {
			funcs = append(funcs, "containerCommand")
			return nil
		},
		DeleteContainers: func(ctx context.Context, dcr *common.DeleteContainersRequest) error {
			funcs = append(funcs, "deleteContainer")
			return nil
		},
		ContainerLog: func(ctx context.Context, clr *agent.ContainerLogRequest) (*g.ContainerLogContext, error) {
			funcs = append(funcs, "containerLog")
			return &g.ContainerLogContext{}, fmt.Errorf("test")
		},
		Close: func(context.Context, agent.CloseReason, g.UpdateOptions) error {
			funcs = append(funcs, "close")
			return nil
		},
	}
}

var commands = []*agent.AgentCommand{
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

func TestReceiveLoop(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockClient := mock_agent.NewMockAgent_ConnectClient(ctrl)
	mockClient.EXPECT().Recv().AnyTimes().DoAndReturn(func() (*agent.AgentCommand, error) {
		return &agent.AgentCommand{
			Command: &agent.AgentCommand_Close{
				Close: &agent.CloseConnectionRequest{Reason: agent.CloseReason_CLOSE},
			},
		}, nil
	})

	mockClientErr := mock_agent.NewMockAgent_ConnectClient(ctrl)
	mockClientErr.EXPECT().Recv().AnyTimes().DoAndReturn(func() (*agent.AgentCommand, error) {
		return nil, g.ErrUnkownAgentCommand
	})

	type args struct {
		stream agent.Agent_ConnectClient
		work   chan *agent.AgentCommand
	}
	tests := []struct {
		name string
		args args
		err  error
	}{
		{
			name: "nil test",
			args: args{
				stream: nil,
			},
			err: g.ErrNilStreamForLoop,
		},
		{
			name: "receive error",
			args: args{
				stream: mockClientErr,
			},
		},

		{
			name: "receive command",
			args: args{
				stream: mockClient,
				work:   make(chan *agent.AgentCommand, g.ParallelProcessing),
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			errs, _ := errgroup.WithContext(context.Background())
			errs.Go(func() error {
				select {
				case cmd := <-tt.args.work:
					assert.Equal(t, "close:{reason:CLOSE}", cmd.String())
					return fmt.Errorf("quit")
				case <-time.After(testTimeout):
					return fmt.Errorf("channel read timed out")
				}
			})

			errs.Go(func() error {
				return g.ReceiveLoop(tt.args.stream, tt.args.work)
			})
			err := errs.Wait()
			if tt.err != nil {
				assert.ErrorIs(t, err, tt.err)
			}
		})
	}
}

func TestProcessLoop(t *testing.T) {
	type args struct {
		l *g.ClientLoop
	}
	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{
			name: "",
			args: args{},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := g.ProcessLoop(tt.args.l); (err != nil) != tt.wantErr {
				t.Errorf("ProcessLoop() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestContextFuncs(t *testing.T) {
	const name = "test-name"

	ctx := g.WithGRPCConfig(context.TODO(), &config.CommonConfiguration{
		Name: name,
	})
	cfg := g.GetConfigFromContext(ctx).(*config.CommonConfiguration)

	assert.Equal(t, name, cfg.Name, "putting values to context should be retrivable")
}
