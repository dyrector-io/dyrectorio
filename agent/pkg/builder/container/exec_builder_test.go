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
	logger := &testLogger{
		test: t,
	}

	containerBuilder := containerbuilder.NewDockerBuilder(context.Background()).
		WithName("test").
		WithImage("alpine:latest").
		WithCmd([]string{"/bin/sh", "-c", "sleep 5"})

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
		WithCmd([]string{"/bin/sh", "-c", "echo test"})

	success, err := execBuilder.Create().Start()

	assert.Nil(t, err)
	assert.True(t, success)
	assert.True(t, logger.gotMessage)

}
