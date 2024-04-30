package container_test

import (
	"testing"

	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
)

type TestLogger struct {
	dogger.LogWriter
	test       *testing.T
	gotMessage bool
}

func (testLogger *TestLogger) WriteInfo(s ...string) {
	testLogger.test.Log(s)
	testLogger.gotMessage = true
}

func (testLogger *TestLogger) WriteError(s ...string) {
	testLogger.test.Log(s)
	testLogger.gotMessage = true
}
