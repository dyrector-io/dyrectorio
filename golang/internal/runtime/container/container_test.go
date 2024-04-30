//go:build unit
// +build unit

package container_test

import (
	"context"
	"errors"
	"fmt"
	"log"
	"regexp"
	"strconv"
	"testing"

	containerRuntime "github.com/dyrector-io/dyrectorio/golang/internal/runtime/container"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/system"
	"github.com/docker/docker/client"
	"github.com/stretchr/testify/assert"
)

type mockDockerClient struct {
	client.APIClient
	version string
	info    *system.Info
}

type mockErrDockerClient struct {
	client.APIClient
}

func newMockClient(version string, info *system.Info) client.APIClient {
	return &mockDockerClient{
		version: version,
		info:    info,
	}
}

func (m mockDockerClient) Info(ctx context.Context) (system.Info, error) {
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

func (m mockErrDockerClient) Info(ctx context.Context) (system.Info, error) {
	return system.Info{}, fmt.Errorf("expected info error")
}

func getDockerInfoDocker() *system.Info {
	return &system.Info{
		InitBinary: "docker-init",
	}
}

func getDockerInfoPodman() *system.Info {
	return &system.Info{
		InitBinary: "",
	}
}

func getDockerInfoInvalid() *system.Info {
	return &system.Info{
		InitBinary: "invalidInitBinaryString",
	}
}

type VersionTestCase struct {
	Info              *system.Info
	MockClientVersion string
}

type VersionTestCaseWithErr struct {
	VersionTestCase
	ErrExpected error
}

var (
	errExternal = errors.New("externalError")
	testCases   = []VersionTestCase{
		// no errors
		{
			Info:              getDockerInfoDocker(),
			MockClientVersion: "23.0.0",
		},
		{
			Info:              getDockerInfoDocker(),
			MockClientVersion: "24.0.0",
		},
		{
			Info:              getDockerInfoPodman(),
			MockClientVersion: "4.4.0",
		},
		{
			Info:              getDockerInfoPodman(),
			MockClientVersion: "4.8.0",
		},
	}
	testCasesErrnous = []VersionTestCaseWithErr{
		// server outdated errors
		{
			VersionTestCase: VersionTestCase{
				Info:              getDockerInfoDocker(),
				MockClientVersion: "20.10.0",
			},
			ErrExpected: containerRuntime.ErrServerIsOutdated,
		},
		{
			VersionTestCase: VersionTestCase{
				Info:              getDockerInfoPodman(),
				MockClientVersion: "4.0.0",
			},
			ErrExpected: containerRuntime.ErrServerIsOutdated,
		},
		{
			VersionTestCase: VersionTestCase{
				Info:              getDockerInfoDocker(),
				MockClientVersion: "19.03.0",
			},
			ErrExpected: containerRuntime.ErrServerVersionIsNotSupported,
		},
		{
			VersionTestCase: VersionTestCase{
				Info:              getDockerInfoPodman(),
				MockClientVersion: "3.4.0",
			},
			ErrExpected: containerRuntime.ErrServerVersionIsNotSupported,
		},
		{
			VersionTestCase: VersionTestCase{
				Info:              getDockerInfoInvalid(),
				MockClientVersion: "23.0.0",
			},
			ErrExpected: containerRuntime.ErrServerUnknown,
		},
		{
			VersionTestCase: VersionTestCase{
				Info:              getDockerInfoInvalid(),
				MockClientVersion: "4.4.0",
			},
			ErrExpected: containerRuntime.ErrServerUnknown,
		},
		// We don't check the specific error there, since it is not covered by the package but by an external dependency.
		{
			VersionTestCase: VersionTestCase{
				Info:              getDockerInfoDocker(),
				MockClientVersion: "a.b.c",
			},
			ErrExpected: errExternal,
		},
		{
			VersionTestCase: VersionTestCase{
				Info:              getDockerInfoPodman(),
				MockClientVersion: "a.b.c",
			},
			ErrExpected: errExternal,
		},
	}
)

func TestVersionCheck(t *testing.T) {
	for _, tC := range testCases {
		_, err := containerRuntime.VersionCheck(context.TODO(), newMockClient(tC.MockClientVersion, tC.Info))
		assert.Nilf(t, err, "unexpected error for valid version input: %s", tC.MockClientVersion)
	}
}

func TestVersionCheckNegative(t *testing.T) {
	for _, tC := range testCasesErrnous {
		_, err := containerRuntime.VersionCheck(context.TODO(), newMockClient(tC.MockClientVersion, tC.Info))
		// if the we expect external error there is no strict error matching
		if errors.Is(tC.ErrExpected, errExternal) {
			assert.Error(t, err)
		} else {
			assert.ErrorIs(t, err, tC.ErrExpected)
		}
	}
}

// not pretty, but constants should only be changed at one place
func getMajorMinor(f *testing.F, versionStr string) (uint16, uint16) {
	re, regErr := regexp.Compile(`(\d+)`)
	if regErr != nil {
		f.Fatal("error compiling regular expression")
	}
	res := re.FindAllString(versionStr, -1)

	major, err := strconv.ParseUint(res[0], 10, 16)
	if err != nil {
		f.Fatal(err)
	}
	minor, err := strconv.ParseUint(res[1], 10, 16)
	if err != nil {
		f.Fatal(err)
	}
	return uint16(major), uint16(minor)
}

func fuzzVersionWithRuntime(_ *testing.F, dockerInfo *system.Info, majorMin, minorMin uint16) func(t *testing.T, major, minor, patch uint16) {
	return func(t *testing.T, major, minor, patch uint16) {
		versionStr := fmt.Sprintf("%d.%d.%d", major, minor, patch)

		_, err := containerRuntime.VersionCheck(context.TODO(), newMockClient(versionStr, dockerInfo))
		if major < majorMin || (major <= majorMin && minor < minorMin) {
			assertAnyError(t, err, versionStr,
				containerRuntime.ErrServerIsOutdated,
				containerRuntime.ErrServerUnknown,
				containerRuntime.ErrServerVersionIsNotSupported,
				containerRuntime.ErrServerVersionIsNotValid,
				containerRuntime.ErrCannotParseServerVersion,
				containerRuntime.ErrCannotSatisfyVersionConstraint,
				containerRuntime.ErrCannotParseVersionConstraint,
			)
		} else {
			assert.Nilf(t, err, "error unexpected if over required constants: %s, err:%s", versionStr, err)
		}
	}
}

func FuzzVersionCheckPodman(f *testing.F) {
	f.Add(uint16(1), uint16(0), uint16(0))
	f.Add(uint16(20), uint16(0), uint16(10))
	f.Add(uint16(4), uint16(0), uint16(0))
	majorMin, minorMin := getMajorMinor(f, containerRuntime.RecommendedPodmanServerVersion)
	dockerInfo := &system.Info{}
	f.Fuzz(fuzzVersionWithRuntime(f, dockerInfo, majorMin, minorMin))
}

func FuzzVersionCheckDocker(f *testing.F) {
	f.Add(uint16(1), uint16(0), uint16(0))
	f.Add(uint16(20), uint16(0), uint16(10))
	f.Add(uint16(21), uint16(0), uint16(10))
	f.Add(uint16(4), uint16(0), uint16(0))
	dockerInfo := &system.Info{
		InitBinary: "docker-init",
	}
	majorMin, minorMin := getMajorMinor(f, containerRuntime.RecommendedDockerServerVersion)
	f.Fuzz(fuzzVersionWithRuntime(f, dockerInfo, majorMin, minorMin))
}

func assertAnyError(t *testing.T, err error, input string, errs ...error) {
	for _, e := range errs {
		if errors.Is(err, e) {
			log.Printf("the error asserted: %s", e.Error())
			return
		}
	}
	if err == nil {
		t.Fatalf("error is nil and it is not in the expected error list, input: %s", input)
	} else {
		t.Fatalf("error is included in expected: %s for input: %s", err.Error(), input)
	}
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
