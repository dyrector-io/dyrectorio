//go:build integration
// +build integration

package container_test

import (
	"os"
	"testing"

	"github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

func TestMain(m *testing.M) {
	var _ container.Container = (*container.DockerContainer)(nil)

	os.Exit(m.Run())
}
