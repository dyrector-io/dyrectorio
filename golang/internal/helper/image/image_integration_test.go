//go:build integration
// +build integration

package image_test

import (
	"context"
	"fmt"
	"testing"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	"github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	imageHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
)

func TestPullImage(t *testing.T) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		t.Fatal(err)
	}

	images, err := cli.ImageList(context.Background(), types.ImageListOptions{
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "reference", Value: "nginx"}),
	})
	if err != nil {
		t.Fatal(err)
	}

	for _, image := range images {
		cli.ImageRemove(context.Background(), image.ID, types.ImageRemoveOptions{
			Force: true,
		})
	}

	err = imageHelper.Pull(context.Background(), nil, "docker.io/library/nginx:latest", "")
	if err != nil {
		t.Fatal(err)
	}

	images, err = cli.ImageList(context.Background(), types.ImageListOptions{
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "reference", Value: "nginx"}),
	})
	if err != nil {
		t.Fatal(err)
	}

	assert.Greater(t, len(images), 0)
}

func TestNewPull(t *testing.T) {
	ctx := context.Background()
	img := "nginx:alpine"
	docker.DeleteImage(ctx, img)
	stat, err := image.PrettyImagePull(ctx, img)
	fmt.Printf("%v", stat)
	assert.Nilf(t, err, "expected err to be nil for a valid image name")
}
