//go:build integration
// +build integration

package image_test

import (
	"context"
	"fmt"
	"io"
	"os"
	"testing"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/jsonmessage"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	imageHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	"github.com/dyrector-io/dyrectorio/golang/pkg/cli"
)

func TestPullImage(t *testing.T) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		t.Fatal(err)
	}

	images, err := cli.ImageList(context.Background(), types.ImageListOptions{
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "reference", Value: "ghcr.io/dyrector-io/mirror/nginx"}),
	})
	if err != nil {
		t.Fatal(err)
	}

	for _, image := range images {
		cli.ImageRemove(context.Background(), image.ID, types.ImageRemoveOptions{
			Force: true,
		})
	}

	err = imageHelper.Pull(context.Background(), cli, nil, nginxImage, "")
	if err != nil {
		t.Fatal(err)
	}

	images, err = cli.ImageList(context.Background(), types.ImageListOptions{
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "reference", Value: "ghcr.io/dyrector-io/mirror/nginx"}),
	})
	if err != nil {
		t.Fatal(err)
	}

	assert.Greater(t, len(images), 0)
}

func logAllIncoming(j jsonmessage.JSONMessage) {
	log.Info().Msgf("%v", j)
}

func TestNewPull(t *testing.T) {
	ctx := context.Background()
	client, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		t.Fatal(err)
	}
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout})
	err = image.CustomImagePull(ctx, client, nginxImage, "", false, false, cli.DockerPullProgressDisplayer)
	assert.Nilf(t, err, "expected err to be nil for a valid image name")
}

func TestPullFullQualifiedImage(t *testing.T) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		t.Fatal(err)
	}
	ctx := context.Background()
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout})
	log.Logger = log.Logger.Level(zerolog.InfoLevel)

	called := false

	cb := image.PullDisplayFn(func(header string, dockerResponse io.ReadCloser) error {
		called = true
		return nil
	})

	err = image.CustomImagePull(ctx, cli, nginxImage, "", true, false, cb)
	assert.Nilf(t, err, "expected err to be nil for a valid image name")
	assert.Truef(t, called, "display func is called")

	exists, err := image.Exists(ctx, cli, nil, nginxImage, "")
	assert.Nilf(t, err, "expected err to be nil for a valid image name")
	assert.Truef(t, exists.LocalExists, "expected image to exist locally after pull")
}

func TestPrettyPullFullQualifiedInvalidImage(t *testing.T) {
	ctx := context.Background()
	client, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		t.Fatal(err)
	}
	img := fmt.Sprintf("%s:nonexistenttag", nginxImageNoTag)
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout})

	err = image.CustomImagePull(ctx, client, img, "", false, false, cli.DockerPullProgressDisplayer)
	assert.ErrorIs(t, err, image.ErrImageNotFound, "expected err to be notfound for a invalid image name")
}
