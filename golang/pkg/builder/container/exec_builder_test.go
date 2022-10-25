//go:build integration
// +build integration

package container_test

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"

	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

func TestExecBuilder(t *testing.T) {
	var _ containerbuilder.ExecBuilder = (*containerbuilder.DockerExecBuilder)(nil)

	logger := &TestLogger{
		test: t,
	}

	containerBuilder := containerbuilder.NewDockerBuilder(context.Background()).
		WithName("test1").
		WithLogWriter(logger).
		WithImage("nginx:latest")

	dockerContainerBuilder := containerBuilder.Create()
	containerID := dockerContainerBuilder.GetContainerID()

	_, containerBuilderErr := dockerContainerBuilder.Start()
	if containerBuilderErr != nil {
		t.Fatal(containerBuilderErr.Error())
	}

	defer builderCleanup(containerBuilder)

	execBuilder := containerbuilder.NewExecBuilder(context.Background(), containerID).
		WithAttachStdout().
		WithLogWriter(logger).
		WithAttachStdout().
		WithCmd([]string{"export"})

	exec, execCreationErr := execBuilder.Create()

	if execCreationErr != nil {
		t.Fatal(execCreationErr.Error())
	}

	execStartErr := exec.Start()

	assert.Nil(t, execStartErr)
	assert.True(t, logger.gotMessage)
}
