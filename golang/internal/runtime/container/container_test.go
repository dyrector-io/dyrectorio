//go:build unit
// +build unit

package container_test

import (
	"context"
	"errors"
	"testing"

	containerRuntime "github.com/dyrector-io/dyrectorio/golang/internal/runtime/container"

	"github.com/docker/docker/api/types"
	"github.com/stretchr/testify/assert"
)

type mockClient struct {
	version string
	info    *types.Info
}

func newMockClient(version string, info *types.Info) *mockClient {
	return &mockClient{
		version: version,
		info:    info,
	}
}

func (m *mockClient) Info(ctx context.Context) (types.Info, error) {
	return *m.info, nil
}

func (m *mockClient) ServerVersion(ctx context.Context) (types.Version, error) {
	return types.Version{
		Version: m.version,
	}, nil
}

func getDockerInfoDocker() *types.Info {
	return &types.Info{
		InitBinary: "docker-init",
	}
}

func getDockerInfoPodman() *types.Info {
	return &types.Info{
		InitBinary: "",
	}
}

func getDockerInfoInvalid() *types.Info {
	return &types.Info{
		InitBinary: "invalidInitBinaryString",
	}
}

func TestVersionCheck(t *testing.T) {
	assert.Nil(t, containerRuntime.VersionCheck(context.TODO(), newMockClient("23.0.0", getDockerInfoDocker())))
	assert.Nil(t, containerRuntime.VersionCheck(context.TODO(), newMockClient("4.4.0", getDockerInfoPodman())))

	assert.ErrorIs(t, containerRuntime.ErrServerIsOutdated,
		containerRuntime.VersionCheck(context.TODO(), newMockClient("20.10.0", getDockerInfoDocker())),
	)
	assert.ErrorIs(t, containerRuntime.ErrServerIsOutdated,
		containerRuntime.VersionCheck(context.TODO(), newMockClient("4.0.0", getDockerInfoPodman())),
	)

	assert.ErrorIs(t, containerRuntime.ErrServerVersionIsNotSupported,
		containerRuntime.VersionCheck(context.TODO(), newMockClient("19.03.0", getDockerInfoDocker())),
	)
	assert.ErrorIs(t, containerRuntime.ErrServerVersionIsNotSupported,
		containerRuntime.VersionCheck(context.TODO(), newMockClient("3.4.0", getDockerInfoPodman())),
	)

	assert.ErrorIs(t, containerRuntime.ErrServerUnknown,
		containerRuntime.VersionCheck(context.TODO(), newMockClient("23.0.0", getDockerInfoInvalid())),
	)
	assert.ErrorIs(t, containerRuntime.ErrServerUnknown,
		containerRuntime.VersionCheck(context.TODO(), newMockClient("4.4.0", getDockerInfoInvalid())),
	)

	// We don't check the specific error there, since it is not covered by the pakcage but by an external dependency.
	assert.Error(t, containerRuntime.VersionCheck(context.TODO(), newMockClient("a.b.c", getDockerInfoDocker())))
	assert.Error(t, containerRuntime.VersionCheck(context.TODO(), newMockClient("a.b.c", getDockerInfoPodman())))
}

func TestSatisfyVersion(t *testing.T) {
	assert.ErrorIs(t, containerRuntime.ErrServerVersionIsNotSupported, containerRuntime.SatisfyVersion("2.0.0", "3.0.0", "1.0.0"))
	assert.ErrorIs(t, containerRuntime.ErrServerIsOutdated, containerRuntime.SatisfyVersion("2.0.0", "3.0.0", "2.0.0"))
	assert.Nil(t, containerRuntime.SatisfyVersion("1.0.0", "2.0.0", "3.0.0"))
}

func TestGetInternalHostname(t *testing.T) {
	dockerClient := newMockClient("23.0.0", getDockerInfoDocker())
	dockerRuntime, err := containerRuntime.GetInternalHostDomain(context.TODO(), dockerClient)
	assert.Nil(t, err)
	assert.Equal(t, dockerRuntime, containerRuntime.DockerHost)

	podmanClient := newMockClient("4.4.0", getDockerInfoPodman())
	podmanRuntime, err := containerRuntime.GetInternalHostDomain(context.TODO(), podmanClient)
	assert.Nil(t, err)
	assert.Equal(t, podmanRuntime, containerRuntime.PodmanHost)

	invalidClient := newMockClient("4.4.0", getDockerInfoInvalid())
	invalidRuntime, err := containerRuntime.GetInternalHostDomain(context.TODO(), invalidClient)
	assert.Equal(t, invalidRuntime, "")
	assert.True(t, errors.Is(containerRuntime.ErrServerUnknown, err))
}

func TestGetContainerRuntime(t *testing.T) {
	podmanClient := newMockClient("4.4.0", getDockerInfoPodman())
	podmanRuntime, err := containerRuntime.GetContainerRuntime(context.TODO(), podmanClient)
	assert.Nil(t, err)
	assert.Equal(t, podmanRuntime, containerRuntime.Podman)

	dockerClient := newMockClient("23.0.0", getDockerInfoDocker())
	dockerRuntime, err := containerRuntime.GetContainerRuntime(context.TODO(), dockerClient)
	assert.Nil(t, err)
	assert.Equal(t, dockerRuntime, containerRuntime.Docker)

	invalidClient := newMockClient("4.4.0", getDockerInfoInvalid())
	invalidRuntime, err := containerRuntime.GetContainerRuntime(context.TODO(), invalidClient)
	assert.True(t, errors.Is(err, containerRuntime.ErrServerUnknown))
	assert.Equal(t, invalidRuntime, "")
}
