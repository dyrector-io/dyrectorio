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

// An ExecBuilder handles the process of creating and starting exec,
// it can be configured using 'With...' methods.
// An ExecBuilder can be created using the DockerExecBuilder method.
type ExecBuilder interface {
	WithAttachStderr() *DockerExecBuilder
	WithAttachStdin() *DockerExecBuilder
	WithAttachStdout() *DockerExecBuilder
	WithClient(client *client.Client) *DockerExecBuilder
	WithCmd(cmd []string) *DockerExecBuilder
	WithDetach() *DockerExecBuilder
	WithLogWriter(logger io.StringWriter) *DockerExecBuilder
	WithPrivileged() *DockerExecBuilder
	WithTTY() *DockerExecBuilder
	WithUser(user *int64) *DockerExecBuilder
	WithWorkingDir(workingDir string) *DockerExecBuilder
	Create() (Exec, error)
}

type DockerExecBuilder struct {
	ctx          context.Context
	client       *client.Client
	containerID  *string
	user         *int64
	workingDir   string
	cmd          []string
	logger       *io.StringWriter
	tty          bool
	detach       bool
	attachStdin  bool
	attachStderr bool
	attachStdout bool
	privileged   bool
}

// A shorthand function for creating a new DockerExecBuilder and calling WithClient.
// Creates a default Docker client which can be overwritten using 'WithClient'.
// Creates a default logger which logs using the 'fmt' package.
func NewExecBuilder(ctx context.Context, containerID *string) *DockerExecBuilder {
	var logger io.StringWriter = &defaultLogger{}
	if containerID == nil {
		panic("Cannot run exec on nil containerID")
	}

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

// Sets the builder to attach stderr to the exec command
func (de *DockerExecBuilder) WithAttachStderr() *DockerExecBuilder {
	de.attachStderr = true
	return de
}

// Sets the builder to attach stdin to the exec command
func (de *DockerExecBuilder) WithAttachStdin() *DockerExecBuilder {
	de.attachStdin = true
	return de
}

// Sets the builder to attach stdout to the exec command
func (de *DockerExecBuilder) WithAttachStdout() *DockerExecBuilder {
	de.attachStdout = true
	return de
}

// Sets the Docker client of the ExecBuilder. By default NewExecBuilder creates a client.
func (de *DockerExecBuilder) WithClient(cli *client.Client) *DockerExecBuilder {
	de.client = cli
	return de
}

// Sets the commands to run as part of exec
func (de *DockerExecBuilder) WithCmd(cmd []string) *DockerExecBuilder {
	de.cmd = cmd
	return de
}

// Sets the builder to detach from the exec command
func (de *DockerExecBuilder) WithDetach() *DockerExecBuilder {
	de.detach = true
	return de
}

// Sets the logger which logs messages releated to the builder (and not the container).
func (de *DockerExecBuilder) WithLogWriter(logger io.StringWriter) *DockerExecBuilder {
	de.logger = &logger
	return de
}

// Sets the builder to run the exec process with extended privileges.
func (de *DockerExecBuilder) WithPrivileged() *DockerExecBuilder {
	de.privileged = true
	return de
}

// Sets if standard streams should be attached to a tty.
func (de *DockerExecBuilder) WithTTY() *DockerExecBuilder {
	de.tty = true
	return de
}

// Sets the UID.
func (de *DockerExecBuilder) WithUser(user *int64) *DockerExecBuilder {
	de.user = user
	return de
}

// Sets the working directory for the exec process inside the container.
func (de *DockerExecBuilder) WithWorkingDir(workingDir string) *DockerExecBuilder {
	de.workingDir = workingDir
	return de
}

// Creates the exec command using the configuration given by 'With...' functions.
func (de *DockerExecBuilder) Create() (Exec, error) {
	execConfig := types.ExecConfig{
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

	if de.user != nil {
		execConfig.User = fmt.Sprint(*de.user)
	}

	response, err := de.client.ContainerExecCreate(de.ctx, *de.containerID, execConfig)
	if err != nil {
		if _, logErr := (*de.logger).WriteString(fmt.Sprintln("Exec create failed: ", err)); logErr != nil {
			fmt.Printf("Failed to write log: %s", logErr.Error())
		}
		return Exec{}, err
	}

	execStartCheck := types.ExecStartCheck{
		Detach: de.detach,
		Tty:    de.tty,
	}

	return Exec{
		ctx:            de.ctx,
		client:         de.client,
		ExecID:         response.ID,
		execStartCheck: execStartCheck,
	}, nil
}

type Exec struct {
	ctx            context.Context
	client         *client.Client
	ExecID         string
	execStartCheck types.ExecStartCheck
}

func (e Exec) Start() error {
	return e.client.ContainerExecStart(e.ctx, e.ExecID, e.execStartCheck)
}
