//go:build integration
// +build integration

package container_test

import (
	"context"
	"fmt"
	"io"
	"testing"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
	"github.com/stretchr/testify/assert"

	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

func builderCleanup(builder *containerbuilder.DockerContainerBuilder) {
	if builder.GetContainerID() != nil {
		containerbuilder.DeleteContainer(context.Background(), *builder.GetContainerID())
	}
	if networks := builder.GetNetworkIDs(); networks != nil {
		for _, network := range networks {
			containerbuilder.DeleteNetwork(context.Background(), network)
		}
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

func TestLogging(t *testing.T) {
	logger := &TestLogger{
		test: t,
	}

	builder := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage("nginx:latest").
		WithLogWriter(logger)

	defer builderCleanup(builder)

	success, err := builder.Create().Start()

	assert.Nil(t, err)
	assert.True(t, success)

	assert.True(t, logger.gotMessage)
}

func TestHooks(t *testing.T) {
	order := []string{}

	builder := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage("nginx:latest").
		WithPreCreateHooks(hookCallback(func() {
			order = append(order, "pre-create")
		})).
		WithPostCreateHooks(hookCallback(func() {
			order = append(order, "post-create")
		})).
		WithPreStartHooks(hookCallback(func() {
			order = append(order, "pre-start")
		})).
		WithPostStartHooks(hookCallback(func() {
			order = append(order, "post-start")
		}))

	defer builderCleanup(builder)

	success, err := builder.Create().Start()

	assert.Nil(t, err)
	assert.True(t, success)

	assert.Equal(t, 4, len(order))
	assert.Equal(t, "pre-create", order[0])
	assert.Equal(t, "post-create", order[1])
	assert.Equal(t, "pre-start", order[2])
	assert.Equal(t, "post-start", order[3])
}

func TestNetwork(t *testing.T) {
	logger := &TestLogger{
		test: t,
	}

	builder := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage("nginx:latest").
		WithName("prefix-container").
		WithLogWriter(logger).
		WithNetworkMode("prefix").
		WithNetworkAliases("prefix-container", "container")

	defer builderCleanup(builder)

	success, err := builder.Create().Start()

	assert.Nil(t, err)
	assert.True(t, success)

	assert.NotNil(t, builder.GetNetworkIDs())
}

func TestAutoRemove(t *testing.T) {
	builder := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage("nginx:latest").
		WithName("prefix-container").
		WithCmd([]string{"bash"}).
		WithAutoRemove(true)

	defer builderCleanup(builder)

	waitResult, err := builder.Create().StartWaitUntilExit()
	if err != nil {
		t.Fatal(err)
	}

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		t.Fatal(err)
	}

	containers, err := cli.ContainerList(context.Background(), types.ContainerListOptions{
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "id", Value: *builder.GetContainerID()}),
	})
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, int64(0), waitResult.StatusCode)
	assert.Zero(t, len(containers))
}

func TestConflict(t *testing.T) {
	preBuilder := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage("nginx:latest").
		WithName("conflicting-container").
		WithLabels(map[string]string{"TEST": "OLD_CONTAINER"})

	defer builderCleanup(preBuilder)
	preBuilder.Create().Start()

	builder := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage("nginx:latest").
		WithName("conflicting-container").
		WithLabels(map[string]string{"TEST": "NEW_CONTAINER"}).
		WithoutConflict()

	defer builderCleanup(builder)
	builder.Create().Start()

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		t.Fatal(err)
	}

	list, err := cli.ContainerList(context.Background(), types.ContainerListOptions{
		All:     true,
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "id", Value: *builder.GetContainerID()}),
	})
	if err != nil {
		t.Fatal(err)
	}

	labelValue, ok := list[0].Labels["TEST"]

	assert.True(t, ok)
	assert.Equal(t, "NEW_CONTAINER", labelValue)
}
