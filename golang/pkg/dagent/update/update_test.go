//go:build unit
// +build unit

package update_test

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"testing"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
	"github.com/docker/docker/errdefs"
	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	imagehelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/update"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	v1 "github.com/opencontainers/image-spec/specs-go/v1"
	"github.com/stretchr/testify/assert"
)

type DockerClientMock struct {
	client.APIClient
	imageCount         int
	denyImageExistence bool
	Image              string
}

type MockClientOpt func(*DockerClientMock) error

func WithImage(image string) MockClientOpt {
	return func(d *DockerClientMock) error {
		d.Image = image
		return nil
	}
}

func WithExistenceDenial() MockClientOpt {
	return func(d *DockerClientMock) error {
		d.denyImageExistence = true
		return nil
	}
}

func WithImageCount(imageCount int) MockClientOpt {
	return func(d *DockerClientMock) error {
		d.imageCount = imageCount
		return nil
	}
}

func NewMockClient(opts ...MockClientOpt) client.APIClient {
	cli := &DockerClientMock{}

	for _, op := range opts {
		op(cli)
	}

	if cli.Image == "" {
		cli.Image = "defaultimage"
	}

	return cli
}

func (d *DockerClientMock) ContainerList(ctx context.Context, opts container.ListOptions) ([]types.Container, error) {
	imgs := []types.Container{}

	if len(opts.Filters.Get("name")) > 0 && opts.Filters.Get("name")[0] == "^own-container-update$" {
		return imgs, nil
	}

	for i := 0; i < d.imageCount; i++ {
		imgs = append(imgs, types.Container{
			ID:    "asd123",
			Names: []string{"own-container"},
			Image: d.Image,
		})
	}
	return imgs, nil
}

func (d *DockerClientMock) ImageList(ctx context.Context, opts types.ImageListOptions) ([]image.Summary, error) {
	if d.denyImageExistence {
		return []image.Summary{}, nil
	}
	return []image.Summary{
		{},
	}, nil
}

func (d *DockerClientMock) ImageInspectWithRaw(ctx context.Context, image string) (types.ImageInspect, []byte, error) {
	return types.ImageInspect{
		ID: "docker.io/library/nginx:latest",
	}, []byte{}, nil
}

func (d *DockerClientMock) ImagePull(ctx context.Context, image string, opts types.ImagePullOptions) (io.ReadCloser, error) {
	if d.denyImageExistence {
		return io.NopCloser(bytes.NewBuffer([]byte{})), errdefs.NotFound(fmt.Errorf("Error from unit test"))
	}
	return io.NopCloser(bytes.NewReader([]byte{})), nil
}

func (d *DockerClientMock) ContainerRename(ctx context.Context, container, newContainerName string) error {
	return nil
}

func (d *DockerClientMock) ContainerInspect(ctx context.Context, cont string) (types.ContainerJSON, error) {
	return types.ContainerJSON{
		ContainerJSONBase: &types.ContainerJSONBase{
			HostConfig: &container.HostConfig{
				RestartPolicy: container.RestartPolicy{
					Name: "always",
				},
			},
		},
		Config: &container.Config{},
	}, nil
}

func (d *DockerClientMock) ContainerCreate(context.Context, *container.Config, *container.HostConfig, *network.NetworkingConfig, *v1.Platform, string) (container.CreateResponse, error) {
	return container.CreateResponse{}, nil
}

func (d *DockerClientMock) ContainerStart(context.Context, string, container.StartOptions) error {
	return nil
}

type DockerClientErrMock struct {
	client.APIClient
}

func (d *DockerClientErrMock) ContainerList(ctx context.Context, opts container.ListOptions) ([]types.Container, error) {
	return []types.Container{{}}, errors.New("test error")
}

var defaultUpdateOptions = grpc.UpdateOptions{
	UpdateAlways:  false,
	UseContainers: true,
}

func TestSelfUpdateNotFound(t *testing.T) {
	cli := NewMockClient(WithImageCount(1), WithImage("nginx"), WithExistenceDenial())
	t.Setenv("HOSTNAME", "own-container")
	err := update.ExecuteSelfUpdate(context.TODO(), cli, &agent.AgentUpdateRequest{
		Token:          "token",
		Tag:            "notfound-tag",
		TimeoutSeconds: 1,
	}, defaultUpdateOptions)
	assert.ErrorIs(t, update.RewriteUpdateErrors(err), update.ErrUpdateImageNotFound)
}

func TestSelfUpdateInvalid(t *testing.T) {
	cli := NewMockClient(WithImageCount(1))
	t.Setenv("HOSTNAME", "own-container")
	err := update.ExecuteSelfUpdate(context.TODO(), cli, &agent.AgentUpdateRequest{
		Token:          "token",
		Tag:            "-----",
		TimeoutSeconds: 1,
	}, defaultUpdateOptions)
	assert.ErrorIs(t, update.RewriteUpdateErrors(err), imagehelper.ErrInvalidTag)
}

func TestSelfUpdateOK(t *testing.T) {
	cli := NewMockClient(WithImage("nginx"), WithImageCount(1))
	t.Setenv("HOSTNAME", "nginx")
	err := update.ExecuteSelfUpdate(context.TODO(), cli, &agent.AgentUpdateRequest{
		Token:          "token",
		Tag:            "latest",
		TimeoutSeconds: 1,
	}, defaultUpdateOptions)
	assert.NoError(t, err, "no error for updating to nginx")
}
