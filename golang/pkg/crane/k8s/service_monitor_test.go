//go:build integration

package k8s_test

import (
	"context"
	"testing"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	k8s "github.com/dyrector-io/dyrectorio/golang/pkg/crane/k8s"

	"github.com/stretchr/testify/assert"
)

func Test(t *testing.T) {
	testAppConf := config.Configuration{CraneInCluster: false}
	m := k8s.NewServiceMonitor(context.Background(), k8s.NewClient(&testAppConf))
	err := m.Deploy("dyo-crux", "crux-api", v1.Metrics{Path: "/metrics", Port: "tcp-metrics"}, "")
	assert.Nil(t, err, "no errors expected with default parameters")
}
