//go:build integration
// +build integration

package image_test

import (
	"context"
	"testing"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
	"github.com/stretchr/testify/assert"

	imageHelper "github.com/dyrector-io/dyrectorio/golang/pkg/helper/image"
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

	err = imageHelper.Pull(context.Background(), nil, "nginx:latest", "")
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
