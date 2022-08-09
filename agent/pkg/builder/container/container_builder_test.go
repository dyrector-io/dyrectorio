//go:build unit
// +build unit

package container_test

import (
	"context"
	"fmt"
	"io"
	"testing"
	"time"

	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
	"github.com/stretchr/testify/assert"

	containerbuilder "github.com/dyrector-io/dyrectorio/agent/pkg/builder/container"
)

type testLogger struct {
	test       *testing.T
	gotMessage bool

	io.StringWriter
}

func (testLogger *testLogger) WriteString(s string) (int, error) {
	testLogger.test.Log(s)
	testLogger.gotMessage = true
	return len(s), nil
}

func builderCleanup(builder *containerbuilder.DockerContainerBuilder) {
	if builder.GetContainerID() != nil {
		containerbuilder.DeleteContainer(*builder.Create().GetContainerID())
	}
}

func assertPortBinding(t *testing.T, portMap nat.PortMap, internal, external string) {
	lookup, _ := nat.NewPort("tcp", internal)
	if !assert.Contains(t, portMap, lookup) {
		return
	}

	list := portMap[lookup]
	assert.Contains(t, list, nat.PortBinding{HostIP: "0.0.0.0", HostPort: external})
}

func hookCallback(callback func()) containerbuilder.LifecycleFunc {
	return func(ctx context.Context, client *client.Client, containerName string,
		containerId *string, mountList []mount.Mount, logger *io.StringWriter) error {
		callback()
		return nil
	}
}

func TestNameWithBuilder(t *testing.T) {
	builder := containerbuilder.NewDockerBuilder(context.Background()).
		WithName("test01").
		WithImage("nginx:latest")

	defer builderCleanup(builder)

	success, err := builder.Create().Start()

	assert.Nil(t, err)
	assert.True(t, success)
}

func TestEnvPortsLabelsRestartPolicySettings(t *testing.T) {
	builder := containerbuilder.NewDockerBuilder(context.Background()).
		WithName("test02").
		WithEnv([]string{"A=B", "E_N_V=123"}).
		WithPortBindings([]containerbuilder.PortBinding{{
			ExposedPort: 1234,
			PortBinding: 2345,
		}}).
		WithPortRanges([]containerbuilder.PortRangeBinding{{
			Internal: containerbuilder.PortRange{
				From: 10,
				To:   20,
			},
			External: containerbuilder.PortRange{
				From: 30,
				To:   40,
			},
		}}).
		WithLabels(map[string]string{
			"LABEL1": "TEST",
			"LABEL2": "1234",
		}).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithImage("nginx:latest")

	defer builderCleanup(builder)

	success, err := builder.Create().Start()

	assert.Nil(t, err)
	assert.True(t, success)

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	container, err := cli.ContainerInspect(context.Background(), *builder.GetContainerID())
	assert.Nil(t, err)

	assert.Equal(t, "/test02", container.Name)

	assert.Contains(t, container.Config.Env, "A=B")
	assert.Contains(t, container.Config.Env, "E_N_V=123")

	assertPortBinding(t, container.HostConfig.PortBindings, "1234", "2345")
	for testPort := 0; testPort < 10; testPort++ {
		assertPortBinding(t, container.HostConfig.PortBindings, fmt.Sprint(10+testPort), fmt.Sprint(30+testPort))
	}

	assert.Contains(t, container.Config.Labels, "LABEL1")
	assert.Equal(t, container.Config.Labels["LABEL1"], "TEST")
	assert.Contains(t, container.Config.Labels, "LABEL2")
	assert.Equal(t, container.Config.Labels["LABEL2"], "1234")

	assert.Equal(t, container.HostConfig.RestartPolicy.Name, string(containerbuilder.AlwaysRestartPolicy))
}

func TestLogger(t *testing.T) {
	logger := &testLogger{
		test: t,
	}

	builder := containerbuilder.NewDockerBuilder(context.Background()).
		WithName("test03").
		WithImage("nginx:latest").
		WithLogWriter(logger)

	defer builderCleanup(builder)

	success, err := builder.Create().Start()

	assert.Nil(t, err)
	assert.True(t, success)

	assert.True(t, logger.gotMessage)
}

func TestHooks(t *testing.T) {
	var preCreate, postCreate, preStart, postStart *time.Time = nil, nil, nil, nil
	start := time.Now()

	builder := containerbuilder.NewDockerBuilder(context.Background()).
		WithName("test03").
		WithImage("nginx:latest").
		WithPreCreateHooks(hookCallback(func() {
			now := time.Now()
			preCreate = &now
		})).
		WithPostCreateHooks(hookCallback(func() {
			now := time.Now()
			postCreate = &now
		})).
		WithPreStartHooks(hookCallback(func() {
			now := time.Now()
			preStart = &now
		})).
		WithPostStartHooks(hookCallback(func() {
			now := time.Now()
			postStart = &now
		}))

	defer builderCleanup(builder)

	builder.Create()

	time.Sleep(time.Millisecond)

	success, err := builder.Start()

	assert.Nil(t, err)
	assert.True(t, success)

	assert.True(t, preCreate.After(start))
	assert.True(t, postCreate.After(*preCreate))
	assert.True(t, preStart.After(*postCreate))
	assert.True(t, postStart.After(*preStart))
}
