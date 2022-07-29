//go:build integration
// +build integration

package dogger_test

import (
	"context"
	"errors"
	"testing"

	"github.com/dyrector-io/dyrectorio/agent/internal/config"
	"github.com/dyrector-io/dyrectorio/agent/internal/dogger"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/crux"
	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc/metadata"
)

type AssertFunc func(*testing.T, *crux.DeploymentStatusMessage) error

type AgentTestStream struct {
	testing   *testing.T
	AssertLog AssertFunc
}

func (tStream AgentTestStream) Send(message *crux.DeploymentStatusMessage) error {
	tStream.testing.Logf("Dogger said: '%s'", message.Log)
	return tStream.AssertLog(tStream.testing, message)
}

func (tStream AgentTestStream) CloseAndRecv() (*agent.Empty, error) {
	return nil, nil
}

func (tStream AgentTestStream) CloseSend() error {
	return nil
}

func (tStream AgentTestStream) Header() (metadata.MD, error) {
	return nil, nil
}

func (tStream AgentTestStream) Trailer() metadata.MD {
	return nil
}

func (tStream AgentTestStream) Context() context.Context {
	return nil
}

func (tStream AgentTestStream) SendMsg(m any) error {
	return nil
}

func (tStream AgentTestStream) RecvMsg(m any) error {
	return nil
}

func TestDoggerSingle(t *testing.T) {
	cfg := &config.CommonConfiguration{}
	deploymentId := "abcd"

	ts := AgentTestStream{
		testing: t,
		AssertLog: func(t *testing.T, message *crux.DeploymentStatusMessage) error {
			expected := []string{"hello"}
			assert.Equal(t, expected, message.Log)
			return nil
		},
	}
	dogger := dogger.NewDeploymentLogger(&deploymentId, ts, context.TODO(), cfg)

	dogger.Write("hello")
}

func TestDoggerMuliple(t *testing.T) {
	cfg := &config.CommonConfiguration{}
	deploymentId := "abcd"

	ts := AgentTestStream{
		testing: t,
		AssertLog: func(t *testing.T, message *crux.DeploymentStatusMessage) error {
			expected := []string{"hello", "abcd"}
			assert.Equal(t, expected, message.Log)
			return nil
		},
	}
	dogger := dogger.NewDeploymentLogger(&deploymentId, ts, context.TODO(), cfg)

	dogger.Write("hello", "abcd")
}

func TestDoggerErrorTest(t *testing.T) {
	cfg := &config.CommonConfiguration{}
	deploymentId := "abcd"

	ts := AgentTestStream{
		testing: t,
		AssertLog: func(t *testing.T, message *crux.DeploymentStatusMessage) error {
			return errors.New("Test error")
		},
	}
	dogger := dogger.NewDeploymentLogger(&deploymentId, ts, context.TODO(), cfg)

	dogger.Write("hello")
}

func TestDoggerDeploymentStatus(t *testing.T) {
	cfg := &config.CommonConfiguration{}
	deploymentId := "abcd"

	ts := AgentTestStream{
		testing: t,
		AssertLog: func(t *testing.T, message *crux.DeploymentStatusMessage) error {
			expected := []string{"hello"}
			assert.Equal(t, expected, message.Log)
			return nil
		},
	}
	dogger := dogger.NewDeploymentLogger(&deploymentId, ts, context.TODO(), cfg)

	dogger.WriteDeploymentStatus(crux.DeploymentStatus_IN_PROGRESS, "hello")
}

func TestDoggerDeploymentStatusError(t *testing.T) {
	cfg := &config.CommonConfiguration{}
	deploymentId := "abcd"

	ts := AgentTestStream{
		testing: t,
		AssertLog: func(t *testing.T, message *crux.DeploymentStatusMessage) error {
			return errors.New("Test error")
		},
	}
	dogger := dogger.NewDeploymentLogger(&deploymentId, ts, context.TODO(), cfg)

	dogger.WriteDeploymentStatus(crux.DeploymentStatus_IN_PROGRESS, "hello")
}

func TestDoggerContainerStatus(t *testing.T) {
	cfg := &config.CommonConfiguration{}
	deploymentId := "abcd"

	ts := AgentTestStream{
		testing: t,
		AssertLog: func(t *testing.T, message *crux.DeploymentStatusMessage) error {
			expected := []string{"hello"}
			assert.Equal(t, expected, message.Log)
			return nil
		},
	}
	dogger := dogger.NewDeploymentLogger(&deploymentId, ts, context.TODO(), cfg)

	dogger.WriteContainerStatus("state", "hello")
}

func TestDoggerContainerStatusError(t *testing.T) {
	cfg := &config.CommonConfiguration{}
	deploymentId := "abcd"

	ts := AgentTestStream{
		testing: t,
		AssertLog: func(t *testing.T, message *crux.DeploymentStatusMessage) error {
			return errors.New("Test error")
		},
	}
	dogger := dogger.NewDeploymentLogger(&deploymentId, ts, context.TODO(), cfg)

	dogger.WriteContainerStatus("state", "hello")
}