//go:build unit
// +build unit

package docker_test

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/thanhpk/randstr"

	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	dockerHelper "github.com/dyrector-io/dyrectorio/golang/pkg/helper/docker"
)

type DockerContainerHelperTestSuite struct {
	suite.Suite
	testContainers []*containerbuilder.DockerContainerBuilder
	dockerClient   client.Client
	ctx            context.Context
	prefix         string
	containerNames []string
}

const (
	nginxImage   = "docker.io/library/nginx:latest"
	prefixLength = 8
)

// Runs before everything
func (testSuite *DockerContainerHelperTestSuite) SetupSuite() {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Err(err).Msg("Could not connect to docker socket.")
	}
	testSuite.dockerClient = *cli
	testSuite.prefix = randstr.Hex(prefixLength)
	testSuite.ctx = context.Background()
	testSuite.containerNames = []string{"nginx1", "nginx2", "nginx3"}

	for i := range testSuite.containerNames {
		preparedContainer := containerbuilder.NewDockerBuilder(context.Background()).
			WithImage(nginxImage).
			WithName(fmt.Sprintf("%s-%s", testSuite.prefix, testSuite.containerNames[i])).
			WithRestartPolicy(containerbuilder.NoRestartPolicy)
		testSuite.testContainers = append(testSuite.testContainers, preparedContainer)
	}
}

// Runs after everything
func (testSuite *DockerContainerHelperTestSuite) TearDownSuite() {
	testSuite.dockerClient.Close()
}

// this function executes before each test case
func (testSuite *DockerContainerHelperTestSuite) SetupTest() {
	for i := range testSuite.testContainers {
		_, err := testSuite.testContainers[i].Create().Start()
		if err != nil {
			log.Fatal().Err(err).Msg("Could not start container")
		}
	}
}

// this function executes after each test case
func (testSuite *DockerContainerHelperTestSuite) TearDownTest() {
	containers, err := testSuite.dockerClient.ContainerList(testSuite.ctx,
		types.ContainerListOptions{
			All: true,
			Filters: filters.NewArgs(
				filters.KeyValuePair{
					Key:   "name",
					Value: fmt.Sprintf("^%s", testSuite.prefix),
				}),
		})
	if err != nil {
		log.Fatal().Err(err).Send()
	}

	timeoutValue := (time.Duration(dockerHelper.DockerClientTimeoutSeconds) * time.Second)
	for i := range containers {
		err = testSuite.dockerClient.ContainerStop(testSuite.ctx, containers[i].ID, &timeoutValue)
		if err != nil {
			log.Warn().Err(err).Send()
		}
		err = testSuite.dockerClient.ContainerRemove(testSuite.ctx, containers[i].ID, types.ContainerRemoveOptions{})
		if err != nil {
			log.Warn().Err(err).Send()
		}
	}
}

func (testSuite *DockerContainerHelperTestSuite) TestGetAllContainers() {
	containers, err := dockerHelper.GetAllContainers(testSuite.ctx, nil)

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.LessOrEqual(testSuite.T(), len(testSuite.testContainers), len(containers),
		"should return at least as many containers as we started/created")
}

func (testSuite *DockerContainerHelperTestSuite) TestGetAllContainersbyName() {
	containers, err := dockerHelper.GetAllContainersByName(testSuite.ctx, nil, fmt.Sprintf("^%s", testSuite.prefix))

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.Equal(testSuite.T(), len(testSuite.testContainers), len(containers),
		"should return the containers we started/created")
}

func (testSuite *DockerContainerHelperTestSuite) TestGetContainerbyNameFound() {
	matched, err := dockerHelper.GetContainerByName(testSuite.ctx, nil, fmt.Sprintf("%s-nginx1", testSuite.prefix), true)

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.Equal(testSuite.T(), fmt.Sprintf("/%s-nginx1", testSuite.prefix), matched.Names[0],
		"should return the containerID of the created container")
}

func (testSuite *DockerContainerHelperTestSuite) TestGetContainerbyNameNotFound() {
	matched, err := dockerHelper.GetContainerByName(testSuite.ctx, nil, fmt.Sprintf("%s-nginx1", randstr.Hex(prefixLength)), false)

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.Nil(testSuite.T(), matched, "should return nil pointer")
}

func (testSuite *DockerContainerHelperTestSuite) TestStopAndRemoveContainer() {
	contName := fmt.Sprintf("%s-%s", testSuite.prefix, testSuite.containerNames[0])
	matched, err := dockerHelper.GetContainerByName(testSuite.ctx, nil, contName, true)
	assert.NoError(testSuite.T(), err, "%s", err)
	assert.Equal(testSuite.T(), "running", matched.State,
		"should return a running container")

	err = dockerHelper.StopContainer(testSuite.ctx, nil, contName)
	assert.NoError(testSuite.T(), err, "%s", err)

	matched, err = dockerHelper.GetContainerByName(testSuite.ctx, nil, contName, true)
	assert.NoError(testSuite.T(), err, "%s", err)
	assert.Equal(testSuite.T(), "exited", matched.State,
		"should return a stopped container")

	err = dockerHelper.RemoveContainer(testSuite.ctx, nil, contName)
	assert.NoError(testSuite.T(), err, "%s", err)

	matched, err = dockerHelper.GetContainerByName(testSuite.ctx, nil, contName, false)
	assert.NoError(testSuite.T(), err, "%s", err)
	assert.Nil(testSuite.T(), matched, "should return nil pointer")
}

func (testSuite *DockerContainerHelperTestSuite) TestDeleteContainer() {
	containers, err := dockerHelper.GetAllContainersByName(testSuite.ctx, nil, fmt.Sprintf("^%s", testSuite.prefix))

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.GreaterOrEqual(testSuite.T(), len(testSuite.testContainers), len(containers),
		"should return number of original containers")

	for i := range testSuite.containerNames {
		err = dockerHelper.DeleteContainerByName(testSuite.ctx, nil, fmt.Sprintf("%s-%s", testSuite.prefix, testSuite.containerNames[i]), true)
		assert.NoError(testSuite.T(), err, "%s", err)
	}

	containers, err = dockerHelper.GetAllContainersByName(testSuite.ctx, nil, fmt.Sprintf("^%s", testSuite.prefix))

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.Equal(testSuite.T(), 0, len(containers),
		"should not return any")
}

func TestDockerContainerHelperTestSuite(t *testing.T) {
	suite.Run(t, new(DockerContainerHelperTestSuite))
}
