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

func (testLogger *TestLogger) WriteInfo(s string) (int, error) {
	testLogger.test.Log(s)
	testLogger.gotMessage = true
	return len(s), nil
}

func (testLogger *TestLogger) WriteError(s string) (int, error) {
	testLogger.test.Log(s)
	testLogger.gotMessage = true
	return len(s), nil
}
