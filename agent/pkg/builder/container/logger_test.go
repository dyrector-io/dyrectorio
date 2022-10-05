package container_test

import (
	"io"
	"testing"
)

type TestLogger struct {
	test       *testing.T
	gotMessage bool

	io.StringWriter
}

func (testLogger *TestLogger) WriteString(s string) (int, error) {
	testLogger.test.Log(s)
	testLogger.gotMessage = true
	return len(s), nil
}
