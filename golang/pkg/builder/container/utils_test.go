//go:build unit
// +build unit

package container_test

import (
	"bytes"
	"encoding/binary"
	"io"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
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

func convertLogLine(line string) []byte {
	length := make([]byte, 4)
	binary.BigEndian.PutUint32(length, uint32(len(line)))
	return append(append([]byte{1, 0, 0, 0}, length...), []byte(line)...)
}

func mergeLogLines(lines []string) []byte {
	data := make([]byte, 0)
	for _, line := range lines {
		data = append(data, convertLogLine(line)...)
	}

	return data
}

func TestReadDockerLogsFromReadCloser(t *testing.T) {
	lines := []string{
		"line 1",
		"line 2",
		"line 3",
	}
	data := mergeLogLines(lines)

	skip := 0
	take := 3
	reader := io.NopCloser(bytes.NewReader(data))
	defer reader.Close()

	expected := lines
	actual := container.ReadDockerLogsFromReadCloser(reader, skip, take)

	assert.EqualValues(t, expected, actual)
}

func TestReadDockerLogsFromReadCloser_DoesNotOvertake(t *testing.T) {
	lines := []string{
		"line 1",
		"line 2",
		"line 3",
	}
	data := mergeLogLines(lines)

	skip := 0
	take := 5
	reader := io.NopCloser(bytes.NewReader(data))
	defer reader.Close()

	expected := lines
	actual := container.ReadDockerLogsFromReadCloser(reader, skip, take)

	assert.EqualValues(t, expected, actual)
}

func TestReadDockerLogsFromReadCloser_Skip(t *testing.T) {
	lines := []string{
		"line 1",
		"line 2",
		"line 3",
	}
	data := mergeLogLines(lines)

	skip := 1
	take := 3
	reader := io.NopCloser(bytes.NewReader(data))
	defer reader.Close()

	expected := lines[:2]
	actual := container.ReadDockerLogsFromReadCloser(reader, skip, take)

	assert.EqualValues(t, expected, actual)
}

func TestReadDockerLogsFromReadCloser_NegativeSkip(t *testing.T) {
	lines := []string{
		"line 1",
		"line 2",
		"line 3",
	}
	data := mergeLogLines(lines)

	skip := 6
	take := 3
	reader := io.NopCloser(bytes.NewReader(data))
	defer reader.Close()

	expected := []string{}
	actual := container.ReadDockerLogsFromReadCloser(reader, skip, take)

	assert.EqualValues(t, expected, actual)
}

func TestReadDockerLogsFromReadCloser_EOFError(t *testing.T) {
	lines := []string{
		"line 1",
		"line 2",
		"line 3",
	}
	data := mergeLogLines(lines)

	skip := 0
	take := 3
	reader := io.NopCloser(bytes.NewReader(data))
	defer reader.Close()

	expected := lines
	actual := container.ReadDockerLogsFromReadCloser(reader, skip, take)

	assert.EqualValues(t, expected, actual)
}

func TestReadDockerLogsFromReadCloser_Take(t *testing.T) {
	lines := []string{
		"line 1",
		"line 2",
		"line 3",
	}
	data := mergeLogLines(lines)

	skip := 0
	take := 2
	reader := io.NopCloser(bytes.NewReader(data))
	defer reader.Close()

	expected := lines[1:]
	actual := container.ReadDockerLogsFromReadCloser(reader, skip, take)

	assert.EqualValues(t, expected, actual)
}

func TestReadDockerLogsFromReadCloser_SkipAndTake(t *testing.T) {
	lines := []string{
		"line 1",
		"line 2",
		"line 3",
	}
	data := mergeLogLines(lines)

	skip := 1
	take := 1
	reader := io.NopCloser(bytes.NewReader(data))
	defer reader.Close()

	expected := lines[1:2]
	actual := container.ReadDockerLogsFromReadCloser(reader, skip, take)

	assert.EqualValues(t, expected, actual)
}

func TestReadDockerLogsFromReadCloser_TakeAll(t *testing.T) {
	lines := []string{
		"line 1",
		"line 2",
		"line 3",
	}
	data := mergeLogLines(lines)

	skip := 0
	take := 0
	reader := io.NopCloser(bytes.NewReader(data))
	defer reader.Close()

	expected := lines
	actual := container.ReadDockerLogsFromReadCloser(reader, skip, take)

	assert.EqualValues(t, expected, actual)
}
