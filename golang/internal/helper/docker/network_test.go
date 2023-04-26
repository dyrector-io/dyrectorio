//go:build integration
// +build integration

package docker_test

import (
	"context"
	"fmt"
	"testing"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/thanhpk/randstr"

	dockerHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
)

type DockerNetworkHelperTestSuite struct {
	suite.Suite
	dockerClient client.APIClient
	ctx          context.Context
	prefix       string
	networkNames []string
}

// Runs before everything
func (testSuite *DockerNetworkHelperTestSuite) SetupSuite() {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Err(err).Msg("Could not connect to docker socket.")
	}
	testSuite.dockerClient = cli
	testSuite.prefix = randstr.Hex(prefixLength)
	testSuite.ctx = context.Background()
	testSuite.networkNames = []string{"network1", "network2"}
}

// Runs after everything
func (testSuite *DockerNetworkHelperTestSuite) TearDownSuite() {
	testSuite.dockerClient.Close()
}

// this function executes before each test case
func (testSuite *DockerNetworkHelperTestSuite) SetupTest() {
	for i := range testSuite.networkNames {
		_, err := testSuite.dockerClient.NetworkCreate(
			testSuite.ctx,
			fmt.Sprintf("%s-%s", testSuite.prefix, testSuite.networkNames[i]),
			types.NetworkCreate{
				CheckDuplicate: true,
				Driver:         "bridge",
			})
		if err != nil {
			log.Fatal().Err(err).Send()
		}
	}
}

// this function executes after each test case
func (testSuite *DockerNetworkHelperTestSuite) TearDownTest() {
	for i := range testSuite.networkNames {
		err := testSuite.dockerClient.NetworkRemove(testSuite.ctx, fmt.Sprintf("%s-%s", testSuite.prefix, testSuite.networkNames[i]))
		if err != nil {
			log.Warn().Err(err).Send()
		}
	}
}

func (testSuite *DockerNetworkHelperTestSuite) TestGetAllNetwork() {
	networks, err := dockerHelper.GetAllNetworks(testSuite.ctx)

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.LessOrEqual(testSuite.T(), len(testSuite.networkNames), len(networks),
		"should return the networks we created")
}

func (testSuite *DockerNetworkHelperTestSuite) TestCreateAndDeleteNetwork() {
	networks, err := dockerHelper.GetAllNetworks(testSuite.ctx)
	assert.NoError(testSuite.T(), err, "%s", err)
	initialNetworks := len(networks)

	// Should not do anything
	err = dockerHelper.CreateNetwork(testSuite.ctx, fmt.Sprintf("%s-%s", testSuite.prefix, testSuite.networkNames[0]), "bridge")
	assert.NoError(testSuite.T(), err, "%s", err)

	networks, err = dockerHelper.GetAllNetworks(testSuite.ctx)
	assert.NoError(testSuite.T(), err, "%s", err)
	assert.Equal(testSuite.T(), initialNetworks, len(networks),
		"should return the initial networks")

	// Should create new network
	err = dockerHelper.CreateNetwork(testSuite.ctx, fmt.Sprintf("%s-%s", testSuite.prefix, "netzwerkdrei"), "bridge")
	assert.NoError(testSuite.T(), err, "%s", err)

	networks, err = dockerHelper.GetAllNetworks(testSuite.ctx)
	assert.NoError(testSuite.T(), err, "%s", err)
	assert.Equal(testSuite.T(), initialNetworks+1, len(networks),
		"should return the initial networks plus one")

	// Delete the new network
	err = dockerHelper.DeleteNetworkByID(testSuite.ctx, fmt.Sprintf("%s-%s", testSuite.prefix, "netzwerkdrei"))
	assert.NoError(testSuite.T(), err, "%s", err)

	networks, err = dockerHelper.GetAllNetworks(testSuite.ctx)
	assert.NoError(testSuite.T(), err, "%s", err)
	assert.Equal(testSuite.T(), initialNetworks, len(networks),
		"should return the initial number of networks after creating and deleting")
}

func TestDockerNetworkHelperTestSuite(t *testing.T) {
	suite.Run(t, new(DockerNetworkHelperTestSuite))
}
