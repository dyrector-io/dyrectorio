// Package container implements a fluent interface for creating and starting
// docker containers.
package container

import (
	"context"
	"fmt"
	"io"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
)

type ExecBuilder interface {
	WithAttachStderr() *DockerExecBuilder
	WithAttachStdin() *DockerExecBuilder
	WithAttachStdout() *DockerExecBuilder
	WithClient(client *client.Client) ExecBuilder
	WithCmd(cmd []string) *DockerExecBuilder
	WithDetach() *DockerExecBuilder
	WithLogWriter(logger io.StringWriter) *DockerExecBuilder
	WithPrivileged() *DockerExecBuilder
	WithTTY() *DockerExecBuilder
	WithUser(user string) *DockerExecBuilder
	WithWorkingDir(workingDir string) *DockerExecBuilder
	Create() *DockerExecBuilder
	Start() (bool, error)
}

type DockerExecBuilder struct {
	ctx          context.Context
	client       *client.Client
	containerID  string
	user         string
	workingDir   string
	cmd          []string
	logger       *io.StringWriter
	execId       string
	tty          bool
	detach       bool
	attachStdin  bool
	attachStderr bool
	attachStdout bool
	privileged   bool
}

func NewExecBuilder(ctx context.Context, containerID string) *DockerExecBuilder {
	var logger io.StringWriter = &defaultLogger{}
	b := DockerExecBuilder{
		ctx:         ctx,
		containerID: containerID,
		logger:      &logger,
	}

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	return b.WithClient(cli)
}

func (de *DockerExecBuilder) WithAttachStderr() *DockerExecBuilder {
	de.attachStderr = true
	return de
}

func (de *DockerExecBuilder) WithAttachStdin() *DockerExecBuilder {
	de.attachStdin = true
	return de
}

func (de *DockerExecBuilder) WithAttachStdout() *DockerExecBuilder {
	de.attachStdout = true
	return de
}

func (de *DockerExecBuilder) WithClient(cli *client.Client) *DockerExecBuilder {
	de.client = cli
	return de
}

func (de *DockerExecBuilder) WithCmd(cmd []string) *DockerExecBuilder {
	de.cmd = cmd
	return de
}

func (de *DockerExecBuilder) WithDetach() *DockerExecBuilder {
	de.detach = true
	return de
}

func (de *DockerExecBuilder) WithLogWriter(logger io.StringWriter) *DockerExecBuilder {
	de.logger = &logger
	return de
}

func (de *DockerExecBuilder) WithPrivileged() *DockerExecBuilder {
	de.privileged = true
	return de
}

func (de *DockerExecBuilder) WithTTY() *DockerExecBuilder {
	de.tty = true
	return de
}

func (de *DockerExecBuilder) WithUser(user string) *DockerExecBuilder {
	de.user = user
	return de
}

func (de *DockerExecBuilder) WithWorkingDir(workingDir string) *DockerExecBuilder {
	de.workingDir = workingDir
	return de
}

func (de *DockerExecBuilder) Create() *DockerExecBuilder {
	execConfig := types.ExecConfig{
		User:         de.user,
		Privileged:   de.privileged,
		Tty:          de.tty,
		AttachStdin:  de.attachStdin,
		AttachStderr: de.attachStderr,
		AttachStdout: de.attachStdout,
		Detach:       de.detach,
		DetachKeys:   "",
		Env:          nil,
		WorkingDir:   de.workingDir,
		Cmd:          de.cmd,
	}
	response, err := de.client.ContainerExecCreate(de.ctx, de.containerID, execConfig)
	if err != nil {
		(*de.logger).WriteString(fmt.Sprintln("Exec create failed: ", err))
	}
	fmt.Println(response, err)
	de.execId = response.ID
	return de
}

func (de *DockerExecBuilder) Start() (bool, error) {
	execStartCheck := types.ExecStartCheck{
		Detach: de.detach,
		Tty:    de.tty,
	}
	err := de.client.ContainerExecStart(de.ctx, de.execId, execStartCheck)
	if err != nil {
		(*de.logger).WriteString(err.Error())
		return false, err
	} else {
		(*de.logger).WriteString(fmt.Sprintf("Ran exec: %s", de.execId))
		return true, nil
	}
}
