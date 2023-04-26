//go:build integration
// +build integration

package container_test

import (
	"context"
	"fmt"
	"io"
	"testing"
	"time"

	"github.com/AlekSi/pointer"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"

	dockerHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

var testLabels = map[string]string{"dyo": "test"}

func baseBuilder(ctx context.Context) containerbuilder.Builder {
	return containerbuilder.NewDockerBuilder(ctx).WithLabels(testLabels)
}

func containerCleanup(container containerbuilder.Container) {
	ctx := context.Background()
	if container.GetContainerID() != nil {
		dockerHelper.DeleteContainerByID(ctx, nil, *container.GetContainerID())
	}
	if networks := container.GetNetworkIDs(); len(networks) > 0 {
		for _, network := range networks {
			err := dockerHelper.DeleteNetworkByID(ctx, network)
			if err != nil {
				log.Error().Str("name", network).Msg("Failed to remove network.")
			}
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
	return func(ctx context.Context, client client.APIClient, containerName string,
		containerId *string, mountList []mount.Mount, logger *io.StringWriter,
	) error {
		callback()
		return nil
	}
}

func TestNameWithBuilder(t *testing.T) {
	var _ containerbuilder.Builder = (*containerbuilder.DockerContainerBuilder)(nil)

	builder := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage("docker.io/library/nginx:latest")

	cont, err := builder.CreateAndStart()
	defer containerCleanup(cont)
	assert.NoError(t, err)
}

func TestEnvPortsLabelsRestartPolicySettings(t *testing.T) {
	cont, err := containerbuilder.NewDockerBuilder(context.Background()).
		WithName("test02").
		WithEnv([]string{"A=B", "E_N_V=123"}).
		WithPortBindings([]containerbuilder.PortBinding{{
			ExposedPort: 1234,
			PortBinding: pointer.ToUint16(2345),
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
		WithImage("docker.io/library/nginx:latest").
		CreateAndStart()

	defer containerCleanup(cont)
	assert.NoError(t, err)
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	container, err := cli.ContainerInspect(context.Background(), *cont.GetContainerID())
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

	cont, err := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage("docker.io/library/nginx:latest").
		WithLogWriter(logger).CreateAndStart()

	defer containerCleanup(cont)
	assert.NoError(t, err)
	assert.True(t, logger.gotMessage)
}

func TestHooks(t *testing.T) {
	order := []string{}

	cont, err := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage("docker.io/library/nginx:latest").
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
		})).
		CreateAndStart()

	defer containerCleanup(cont)

	assert.NoError(t, err)
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

	cont, err := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage("docker.io/library/nginx:latest").
		WithName("prefix-container").
		WithLogWriter(logger).
		WithNetworkMode("prefix").
		WithNetworkAliases("prefix-container", "container").
		CreateAndStart()

	defer containerCleanup(cont)

	assert.NoError(t, err)
	assert.NotEmpty(t, cont.GetNetworkIDs())
}

func TestAutoRemove(t *testing.T) {
	ctx := context.Background()

	_, waitResult, err := baseBuilder(ctx).
		WithName("prefix-container").
		WithImage("docker.io/library/nginx:latest").
		WithCmd([]string{"echo", "test"}).
		WithAutoRemove(true).CreateAndStartWaitUntilExit()
	assert.NoError(t, err)

	// unfortunately container is not removed instantly from the docker engine, regardless of our wait until the exit
	// we attempt to wait 5 seconds
	containerRemoved := false
	for i := 0; i < 10; i++ {
		containers, err := dockerHelper.GetAllContainersByLabel(ctx, "dyo=test")
		if err != nil {
			t.Fatal(err)
		}
		if len(containers) == 0 {
			containerRemoved = true
			break
		}
		time.Sleep(time.Second / 2)
	}

	assert.Equal(t, int64(0), waitResult.StatusCode, "exit code expected to be zero, logs: %v", waitResult.Logs)
	assert.True(t, containerRemoved, "container should be removed in 5 seconds after exit")
}

func TestConflict(t *testing.T) {
	cont1, err := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage("docker.io/library/nginx:latest").
		WithName("conflicting-container").
		WithLabels(map[string]string{"TEST": "OLD_CONTAINER"}).
		CreateAndStart()

	defer containerCleanup(cont1)
	assert.NoError(t, err)

	cont2, err := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage("docker.io/library/nginx:latest").
		WithName("conflicting-container").
		WithLabels(map[string]string{"TEST": "NEW_CONTAINER"}).
		WithoutConflict().
		CreateAndStart()

	defer containerCleanup(cont2)
	assert.NoError(t, err)

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		t.Fatal(err)
	}

	list, err := cli.ContainerList(context.Background(), types.ContainerListOptions{
		All:     true,
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "id", Value: *cont2.GetContainerID()}),
	})
	if err != nil {
		t.Fatal(err)
	}

	labelValue, ok := list[0].Labels["TEST"]

	assert.True(t, ok)
	assert.Equal(t, "NEW_CONTAINER", labelValue)
}
