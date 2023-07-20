//go:build unit
// +build unit

package container_test

import (
	"context"
	"fmt"
	"testing"

	"github.com/AlekSi/pointer"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/stretchr/testify/assert"

	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

type BuilderTestCase struct {
	builder            *containerbuilder.DockerContainerBuilder
	expHostConfig      *container.HostConfig
	expContainerConfig *container.Config
	explanation        string
	err                error
}

type networkMockClient struct {
	client.APIClient
	createResp  types.NetworkCreateResponse
	listResp    []types.NetworkResource
	networks    []string
	networkMode string
	logConfig   *container.LogConfig
	user        *int64
	err         error
}

func (n networkMockClient) NetworkCreate(ctx context.Context, name string, netOpts types.NetworkCreate) (types.NetworkCreateResponse, error) {
	return n.createResp, n.err
}

func (n networkMockClient) NetworkList(ctx context.Context, listOpts types.NetworkListOptions) ([]types.NetworkResource, error) {
	return n.listResp, n.err
}

func getBuilder(mockClient networkMockClient) *containerbuilder.DockerContainerBuilder {
	builder := &containerbuilder.DockerContainerBuilder{}
	builder.
		WithClient(mockClient).
		WithNetworks(mockClient.networks).
		WithUser(mockClient.user).
		WithLogConfig(mockClient.logConfig).
		WithNetworkMode(mockClient.networkMode)
	return builder
}

func TestBuilderToConfig(t *testing.T) {
	testLogConfig := container.LogConfig{
		Type:   "test",
		Config: map[string]string{},
	}
	testCases := []BuilderTestCase{
		{
			builder:            getBuilder(networkMockClient{err: fmt.Errorf("test error"), networks: []string{"test"}}),
			expHostConfig:      nil,
			expContainerConfig: nil,
			err:                fmt.Errorf("test error"),
			explanation:        "if error is thrown, everything is nil",
		},
		// set variables and expect them to be set in the returned objects
		{
			builder: getBuilder(networkMockClient{user: pointer.ToInt64(1), networkMode: "teest", logConfig: &testLogConfig}),
			expHostConfig: &container.HostConfig{
				LogConfig: testLogConfig,
			},
			expContainerConfig: &container.Config{
				User: "1",
			},
			err: nil,
		},
		{
			builder: getBuilder(networkMockClient{networkMode: "host"}),
			expHostConfig: &container.HostConfig{
				NetworkMode: "host",
			},
			expContainerConfig: &container.Config{},
			err:                nil,
		},
		{
			builder: getBuilder(networkMockClient{networkMode: "none"}),
			expHostConfig: &container.HostConfig{
				NetworkMode: "none",
			},
			expContainerConfig: &container.Config{},
			err:                nil,
		},
	}

	for i, tc := range testCases {
		hc, cc, err := containerbuilder.BuilderToDockerConfig(tc.builder)
		assert.Equalf(t, tc.expHostConfig, hc, "builder config map should match expected test case (%d)", i)
		assert.Equalf(t, tc.expContainerConfig, cc, "builder config map should match expected test case (%d)", i)
		if tc.err != nil {
			assert.ErrorContainsf(t, err, tc.err.Error(), "builder config map should match expected test case(%d)", i)
		} else {
			assert.Nilf(t, err, "builder config mapping should not return err in testcase: %d", i)
		}
	}
}
