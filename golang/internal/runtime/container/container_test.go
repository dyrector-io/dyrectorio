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

type VersionTestCase struct {
	Info              *types.Info
	MockClientVersion string
	ErrExpected       error
}

// TODO(@nandor-magyar): this should be refactored into an iterated test case, this kind of repetition is undesired
func TestVersionCheck(t *testing.T) {
	errExternal := errors.New("externalError")
	testCases := []VersionTestCase{
		// no errors
		{
			Info:              getDockerInfoDocker(),
			MockClientVersion: "23.0.0",
			ErrExpected:       nil,
		},
		{
			Info:              getDockerInfoPodman(),
			MockClientVersion: "4.4.0",
			ErrExpected:       nil,
		},
		// server outdated errors
		{
			Info:              getDockerInfoDocker(),
			MockClientVersion: "20.10.0",
			ErrExpected:       containerRuntime.ErrServerIsOutdated,
		},
		{
			Info:              getDockerInfoPodman(),
			MockClientVersion: "4.0.0",
			ErrExpected:       containerRuntime.ErrServerIsOutdated,
		},
		{
			Info:              getDockerInfoDocker(),
			MockClientVersion: "19.03.0",
			ErrExpected:       containerRuntime.ErrServerVersionIsNotSupported,
		},
		{
			Info:              getDockerInfoPodman(),
			MockClientVersion: "3.4.0",
			ErrExpected:       containerRuntime.ErrServerVersionIsNotSupported,
		},
		{
			Info:              getDockerInfoInvalid(),
			MockClientVersion: "23.0.0",
			ErrExpected:       containerRuntime.ErrServerUnknown,
		},
		{
			Info:              getDockerInfoInvalid(),
			MockClientVersion: "4.4.0",
			ErrExpected:       containerRuntime.ErrServerUnknown,
		},
		// We don't check the specific error there, since it is not covered by the pakcage but by an external dependency.
		{
			Info:              getDockerInfoDocker(),
			MockClientVersion: "a.b.c",
			ErrExpected:       errExternal,
		},
		{
			Info:              getDockerInfoDocker(),
			MockClientVersion: "a.b.c",
			ErrExpected:       errExternal,
		},
	}

	for _, tC := range testCases {
		_, err := containerRuntime.VersionCheck(context.TODO(), newMockClient(tC.MockClientVersion, tC.Info))
		// if the we expect external error there is no strict error matching
		if errors.Is(tC.ErrExpected, errExternal) {
			assert.Error(t, err)
		} else {
			assert.ErrorIs(t, err, tC.ErrExpected)
		}
	}
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
