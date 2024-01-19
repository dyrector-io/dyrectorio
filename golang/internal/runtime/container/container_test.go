//go:build unit
// +build unit

package container_test

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"testing"

	containerRuntime "github.com/dyrector-io/dyrectorio/golang/internal/runtime/container"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/stretchr/testify/assert"
)

type mockDockerClient struct {
	client.APIClient
	version string
	info    *types.Info
}

type mockErrDockerClient struct {
	client.APIClient
}

func newMockClient(version string, info *types.Info) client.APIClient {
	return &mockDockerClient{
		version: version,
		info:    info,
	}
}

func (m mockDockerClient) Info(ctx context.Context) (types.Info, error) {
	return *m.info, nil
}

func (m mockDockerClient) ServerVersion(ctx context.Context) (types.Version, error) {
	return types.Version{
		Version: m.version,
	}, nil
}

func newErrMockClient() client.APIClient {
	return &mockErrDockerClient{}
}

func (m mockErrDockerClient) ServerVersion(ctx context.Context) (types.Version, error) {
	return types.Version{}, fmt.Errorf("expected version error")
}

func (m mockErrDockerClient) Info(ctx context.Context) (types.Info, error) {
	return types.Info{}, fmt.Errorf("expected info error")
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
		// We don't check the specific error there, since it is not covered by the package but by an external dependency.
		{
			Info:              getDockerInfoDocker(),
			MockClientVersion: "a.b.c",
			ErrExpected:       errExternal,
		},
		{
			Info:              getDockerInfoPodman(),
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

func FuzzVersionCheck(f *testing.F) {
	testCases := []VersionTestCase{
		// no errors
		{
			Info:              getDockerInfoDocker(),
			MockClientVersion: "23.0.0",
		},
		{
			Info:              getDockerInfoPodman(),
			MockClientVersion: "4.4.0",
		},
		// server outdated errors
		{
			Info:              getDockerInfoDocker(),
			MockClientVersion: "20.10.0",
		},
		{
			Info:              getDockerInfoPodman(),
			MockClientVersion: "4.0.0",
		},
		{
			Info:              getDockerInfoDocker(),
			MockClientVersion: "19.03.0",
		},
		{
			Info:              getDockerInfoPodman(),
			MockClientVersion: "3.4.0",
		},
		{
			Info:              getDockerInfoInvalid(),
			MockClientVersion: "23.0.0",
		},
		{
			Info:              getDockerInfoInvalid(),
			MockClientVersion: "4.4.0",
		},
		// We don't check the specific error there, since it is not covered by the package but by an external dependency.
		{
			Info:              getDockerInfoDocker(),
			MockClientVersion: "a.b.c",
		},
		{
			Info:              getDockerInfoPodman(),
			MockClientVersion: "a.b.c",
		},
	}

	// seed corpus
	for _, tC := range testCases {
		f.Add(tC.MockClientVersion, tC.Info.InitBinary)
	}

	f.Fuzz(func(t *testing.T, mockClientVersion, dockerInitBinary string) {
		// check for valid input
		re, err := regexp.Compile(`(\d+)\.(\d+)\.(\d+)`)
		if err != nil {
			t.Error("Error compiling regular expression")
			return
		}
		if !re.MatchString(mockClientVersion) {
			t.Skip()
		}

		// mock docker info
		dockerInfo := &types.Info{
			InitBinary: dockerInitBinary,
		}

		_, err = containerRuntime.VersionCheck(context.TODO(), newMockClient(mockClientVersion, dockerInfo))
		if err != nil {
			// create a function to verify expected error
			switch err {
			case containerRuntime.ErrServerIsOutdated:
				if dockerInfo == getDockerInfoDocker() {
					assert.ErrorIs(t, containerRuntime.SatisfyVersion(containerRuntime.MinimumDockerServerVersion, containerRuntime.RecommendedDockerServerVersion, mockClientVersion), err)
				}
				if dockerInfo == getDockerInfoPodman() {
					assert.ErrorIs(t, containerRuntime.SatisfyVersion(containerRuntime.MinimumPodmanServerVersion, containerRuntime.RecommendedPodmanServerVersion, mockClientVersion), err)
				}
			case containerRuntime.ErrServerVersionIsNotSupported:
				if dockerInfo == getDockerInfoDocker() {
					assert.ErrorIs(t, containerRuntime.SatisfyVersion(containerRuntime.MinimumDockerServerVersion, containerRuntime.RecommendedDockerServerVersion, mockClientVersion), err)
				}
				if dockerInfo == getDockerInfoPodman() {
					assert.ErrorIs(t, containerRuntime.SatisfyVersion(containerRuntime.MinimumPodmanServerVersion, containerRuntime.RecommendedPodmanServerVersion, mockClientVersion), err)
				}
			case containerRuntime.ErrServerUnknown:
				_, serverErr := containerRuntime.GetContainerRuntime(context.TODO(), newMockClient(mockClientVersion, dockerInfo))
				assert.ErrorIs(t, serverErr, serverErr)
			default:
				// handle external error
				assert.Error(t, err)
			}
		}
	})
}

func TestErrors(t *testing.T) {
	errClient := newErrMockClient()
	_, err := containerRuntime.VersionCheck(context.TODO(), errClient)
	assert.ErrorContains(t, err, "expected version error", "mock error should be thrown")

	_, err = containerRuntime.GetInternalHostDomain(context.TODO(), errClient)
	assert.ErrorContains(t, err, "expected info error", "mock error should be thrown")
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
	assert.Equal(t, containerRuntime.UnknownRuntime, invalidRuntime, "unknown-runtime is recognized")
	assert.ErrorIs(t, err, containerRuntime.ErrServerUnknown, "error is not set for unknown runtimes")
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
	assert.Equal(t, containerRuntime.UnknownRuntime, invalidRuntime, "unknown-runtime is recognized")
	assert.ErrorIs(t, err, containerRuntime.ErrServerUnknown, "error is not set for unknown runtimes")
}
