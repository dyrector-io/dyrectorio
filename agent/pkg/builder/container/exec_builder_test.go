//go:build integration
// +build integration

package container_test

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"

	containerbuilder "github.com/dyrector-io/dyrectorio/agent/pkg/builder/container"
)

func TestExecBuilder(t *testing.T) {
	var _ containerbuilder.ExecBuilder = (*containerbuilder.DockerExecBuilder)(nil)

	logger := &testLogger{
		test: t,
	}

	containerBuilder := containerbuilder.NewDockerBuilder(context.Background()).
		WithName("test1").
		WithLogWriter(logger).
		WithImage("nginx:latest")

	dockerContainerBuilder := containerBuilder.Create()
	containerID := dockerContainerBuilder.GetContainerID()

	_, err2 := dockerContainerBuilder.Start()
	if err2 != nil {
		panic(err2.Error())
	}

	defer builderCleanup(containerBuilder)

	execBuilder := containerbuilder.NewExecBuilder(context.Background(), containerID).
		WithAttachStdout().
		WithLogWriter(logger).
		WithAttachStdout().
		WithCmd([]string{"export"})

	exec, execCreationErr := execBuilder.Create()

	if execCreationErr != nil {
		panic(execCreationErr.Error())
	}

	errExecStart := exec.Start()

	assert.Nil(t, errExecStart)
	assert.True(t, logger.gotMessage)
}
