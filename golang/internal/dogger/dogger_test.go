//go:build integration
// +build integration

package dogger_test

import (
	"context"
	"testing"

	"github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc/metadata"
)

type AgentTestStream struct {
	testing  *testing.T
	messages []string
}

func (tStream *AgentTestStream) Send(message *common.DeploymentStatusMessage) error {
	tStream.testing.Logf("Dogger said: '%s'", message.Log)
	tStream.messages = append(tStream.messages, message.Log...)
	return nil
}

func (tStream *AgentTestStream) CloseAndRecv() (*common.Empty, error) {
	return nil, nil
}

func (tStream *AgentTestStream) CloseSend() error {
	return nil
}

func (tStream *AgentTestStream) Header() (metadata.MD, error) {
	return nil, nil
}

func (tStream *AgentTestStream) Trailer() metadata.MD {
	return nil
}

func (tStream *AgentTestStream) Context() context.Context {
	return nil
}

func (tStream *AgentTestStream) SendMsg(m any) error {
	return nil
}

func (tStream *AgentTestStream) RecvMsg(m any) error {
	return nil
}

func assertDoggerMessage(t *testing.T, ts *AgentTestStream, messages []string) {
	assert.Equal(t, len(messages), len(ts.messages))

	for _, value := range messages {
		assert.Contains(t, ts.messages, value)
	}
}

func TestDoggerSingleStatusMessage(t *testing.T) {
	cfg := &config.CommonConfiguration{}
	deploymentId := "abcd"

	ts := &AgentTestStream{
		testing: t,
	}
	dogger := dogger.NewDeploymentLogger(context.Background(), &deploymentId, ts, cfg)

	dogger.Write("hello")

	assertDoggerMessage(t, ts, []string{"hello"})
}

func TestDoggerMulipleStatusMessages(t *testing.T) {
	cfg := &config.CommonConfiguration{}
	deploymentId := "abcd"

	ts := &AgentTestStream{
		testing: t,
	}
	dogger := dogger.NewDeploymentLogger(context.Background(), &deploymentId, ts, cfg)

	dogger.Write("hello", "abcd")

	assertDoggerMessage(t, ts, []string{"hello", "abcd"})
}

func TestDoggerDeploymentStatus(t *testing.T) {
	cfg := &config.CommonConfiguration{}
	deploymentId := "abcd"

	ts := &AgentTestStream{
		testing: t,
	}
	dogger := dogger.NewDeploymentLogger(context.Background(), &deploymentId, ts, cfg)

	dogger.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, "hello")

	assertDoggerMessage(t, ts, []string{"hello"})
}

func TestDoggerContainerStatus(t *testing.T) {
	cfg := &config.CommonConfiguration{}
	deploymentId := "abcd"

	ts := &AgentTestStream{
		testing: t,
	}
	dogger := dogger.NewDeploymentLogger(context.Background(), &deploymentId, ts, cfg)

	dogger.WriteContainerState("state", "hello")

	assertDoggerMessage(t, ts, []string{"hello"})
}
