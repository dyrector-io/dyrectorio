//go:build integration

package k8s_test

import (
	"context"
	"os"
	"testing"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	k8s "github.com/dyrector-io/dyrectorio/golang/pkg/crane/k8s"
	"github.com/ilyakaznacheev/cleanenv"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
)

func TestMain(m *testing.M) {
	// setup servicemonitor CRDs
	cli := k8s.NewClient(getTestConfig())
	exitCode := 0
	if !cli.VerifyAPIResourceExists(k8s.ServiceMonitorVersion, k8s.ServiceMonitorKind) {
		log.Warn().Msg("No service monitor CRDs available, skipping tests.")
	} else {
		exitCode = m.Run()
	}

	os.Exit(exitCode)
}

func TestServiceMonitorSpawning(t *testing.T) {
	m, err := k8s.NewServiceMonitor(context.Background(), k8s.NewClient(getTestConfig()))
	assert.Nil(t, err, "client is spawned without errors")
	err = m.Deploy("crane-sm-test", "test-sm", v1.Metrics{Path: "/metrics", Port: 8080}, "")
	assert.Nil(t, err, "no errors expected with default parameters")
}

func getTestConfig() *config.Configuration {
	cfg := config.Configuration{}
	_ = cleanenv.ReadEnv(&cfg)
	return &cfg
}
