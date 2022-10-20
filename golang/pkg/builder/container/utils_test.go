//go:build unit
// +build unit

package container_test

import (
	"context"
	"testing"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
	"github.com/stretchr/testify/assert"

	builder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

func TestRegistryAuthUpdateBase64Empty(t *testing.T) {
	val := builder.RegistryAuthBase64("", "")

	assert.Equal(t, "", val)
}

func TestRegistryAuthUpdateBase64WithoutUser(t *testing.T) {
	val := builder.RegistryAuthBase64("", "test1234")

	assert.Equal(t, "", val)
}

func TestRegistryAuthUpdateBase64WithoutPass(t *testing.T) {
	val := builder.RegistryAuthBase64("test", "")

	assert.Equal(t, "", val)
}

func TestRegistryAuthUpdateBase64Correct(t *testing.T) {
	val := builder.RegistryAuthBase64("test", "test1234")

	assert.Equal(t, "eyJ1c2VybmFtZSI6InRlc3QiLCJwYXNzd29yZCI6InRlc3QxMjM0In0=", val)
}

func TestPullImage(t *testing.T) {
	logger := &TestLogger{
		test: t,
	}

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

	err = builder.PullImage(context.Background(), logger, "nginx:latest", "")
	if err != nil {
		t.Fatal(err)
	}

	images, err = cli.ImageList(context.Background(), types.ImageListOptions{
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "reference", Value: "nginx"}),
	})
	if err != nil {
		t.Fatal(err)
	}

	assert.True(t, logger.gotMessage)
	assert.Greater(t, len(images), 0)
}
