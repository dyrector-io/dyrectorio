//go:build integration
// +build integration

package docker_test

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/AlekSi/pointer"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/thanhpk/randstr"

	dockerHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	"github.com/dyrector-io/dyrectorio/golang/internal/label"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

type DockerContainerHelperTestSuite struct {
	suite.Suite
	testContainers []containerbuilder.Builder
	dockerClient   client.Client
	ctx            context.Context
	prefix         string
	containerNames []string
}

const (
	nginxImage                 = "docker.io/library/nginx:latest"
	prefixLength               = 8
	dockerClientTimeoutSeconds = 30
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
		_, err := testSuite.testContainers[i].CreateAndStart()
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

	timeoutValue := (time.Duration(dockerClientTimeoutSeconds) * time.Second)
	for i := range containers {
		err = testSuite.dockerClient.ContainerStop(testSuite.ctx, containers[i].ID, container.StopOptions{Timeout: pointer.ToIntOrNil(int(timeoutValue.Seconds()))})
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
	containers, err := dockerHelper.GetAllContainers(testSuite.ctx)

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.LessOrEqual(testSuite.T(), len(testSuite.testContainers), len(containers),
		"should return at least as many containers as we started/created")
}

func (testSuite *DockerContainerHelperTestSuite) TestGetAllContainersbyName() {
	containers, err := dockerHelper.GetAllContainersByName(testSuite.ctx, fmt.Sprintf("^%s", testSuite.prefix))

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.Equal(testSuite.T(), len(testSuite.testContainers), len(containers),
		"should return the containers we started/created")
}

func (testSuite *DockerContainerHelperTestSuite) TestGetContainerbyNameFound() {
	matched, err := getContainerByNameWithNotFoundError(testSuite.ctx, fmt.Sprintf("%s-nginx1", testSuite.prefix))

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.Equal(testSuite.T(), fmt.Sprintf("/%s-nginx1", testSuite.prefix), matched.Names[0],
		"should return the containerID of the created container")
}

func (testSuite *DockerContainerHelperTestSuite) TestGetContainerbyNameNotFound() {
	matched, err := dockerHelper.GetContainerByName(testSuite.ctx, fmt.Sprintf("%s-nginx1", randstr.Hex(prefixLength)))

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.Nil(testSuite.T(), matched, "should return nil pointer")
}

func (testSuite *DockerContainerHelperTestSuite) TestDeleteContainer() {
	containers, err := dockerHelper.GetAllContainersByName(testSuite.ctx, fmt.Sprintf("^%s", testSuite.prefix))

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.GreaterOrEqual(testSuite.T(), len(testSuite.testContainers), len(containers),
		"should return number of original containers")

	targetContainer := containers[0]

	err = dockerHelper.DeleteContainer(testSuite.ctx, &targetContainer)
	assert.NoError(testSuite.T(), err, "%s", err)

	containers, err = dockerHelper.GetAllContainersByName(testSuite.ctx, fmt.Sprintf("^%s", testSuite.prefix))
	assert.NoError(testSuite.T(), err, "%s", err)

	for _, cont := range containers {
		assert.NotEqual(testSuite.T(), targetContainer.ID, cont.ID, "should be deleted")
	}
}

func (testSuite *DockerContainerHelperTestSuite) TestDeleteContainerByName() {
	containers, err := dockerHelper.GetAllContainersByName(testSuite.ctx, fmt.Sprintf("^%s", testSuite.prefix))

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.GreaterOrEqual(testSuite.T(), len(testSuite.testContainers), len(containers),
		"should return number of original containers")

	for i := range testSuite.containerNames {
		err = dockerHelper.DeleteContainerByName(testSuite.ctx, fmt.Sprintf("%s-%s", testSuite.prefix, testSuite.containerNames[i]))
		assert.NoError(testSuite.T(), err, "%s", err)
	}

	containers, err = dockerHelper.GetAllContainersByName(testSuite.ctx, fmt.Sprintf("^%s", testSuite.prefix))

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.Equal(testSuite.T(), 0, len(containers),
		"should not return any")
}

func (testSuite *DockerContainerHelperTestSuite) DeleteContainersByLabel() {
	containers, err := dockerHelper.GetAllContainersByName(testSuite.ctx, fmt.Sprintf("^%s", testSuite.prefix))

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.GreaterOrEqual(testSuite.T(), len(testSuite.testContainers), len(containers),
		"should return number of original containers")

	err = dockerHelper.DeleteContainersByLabel(testSuite.ctx, util.JoinV("=", label.ContainerPrefix, testSuite.prefix))
	assert.NoError(testSuite.T(), err, "%s", err)

	containers, err = dockerHelper.GetAllContainersByName(testSuite.ctx, fmt.Sprintf("^%s", testSuite.prefix))

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.Equal(testSuite.T(), 0, len(containers),
		"should not return any")
}

func (testSuite *DockerContainerHelperTestSuite) TestDeleteContainerByID() {
	containers, err := dockerHelper.GetAllContainersByName(testSuite.ctx, fmt.Sprintf("^%s", testSuite.prefix))

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.GreaterOrEqual(testSuite.T(), len(testSuite.testContainers), len(containers),
		"should return number of original containers")

	for _, cont := range containers {
		err = dockerHelper.DeleteContainerByID(testSuite.ctx, nil, cont.ID)
		assert.NoError(testSuite.T(), err, "%s", err)
	}

	containers, err = dockerHelper.GetAllContainersByName(testSuite.ctx, fmt.Sprintf("^%s", testSuite.prefix))

	assert.NoError(testSuite.T(), err, "%s", err)
	assert.Equal(testSuite.T(), 0, len(containers),
		"should not return any")
}

func TestDockerContainerHelperTestSuite(t *testing.T) {
	suite.Run(t, new(DockerContainerHelperTestSuite))
}

func getContainerByNameWithNotFoundError(ctx context.Context, nameFilter string) (*types.Container, error) {
	container, err := dockerHelper.GetContainerByName(ctx, nameFilter)
	if err != nil {
		return nil, err
	} else if container == nil {
		return nil, fmt.Errorf("container not found")
	}

	return container, err
}
