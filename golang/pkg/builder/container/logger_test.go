package container_test

import (
	"testing"

	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
)

type TestLogger struct {
	test       *testing.T
	gotMessage bool

	dogger.LogWriter
}

func (testLogger *TestLogger) WriteInfo(s string) {
	testLogger.test.Log(s)
	testLogger.gotMessage = true
}

func (testLogger *TestLogger) WriteError(s string) {
	testLogger.test.Log(s)
	testLogger.gotMessage = true
}
