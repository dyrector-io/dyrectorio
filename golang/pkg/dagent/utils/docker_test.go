//go:build unit
// +build unit

package utils_test

import (
	"bytes"
	"encoding/binary"
	"io"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/utils"
)

// if the `a` map is empty
func TestMapToSliceUniqueMerger_EmptyA(t *testing.T) {
	a := make(map[string]string)
	b := map[string]string{
		"VAR1": "levenTest1",
		"VAR2": "teasdasdmnj1312",
	}
	c := utils.MergeStringMapToUniqueSlice(a, b)
	assert.ElementsMatch(t, c, []string{"VAR1=levenTest1", "VAR2=teasdasdmnj1312"})
}

func TestMapToSliceUniqueMerger_EmptyB(t *testing.T) {
	a := map[string]string{
		"VAR1": "levenTest1",
		"VAR2": "teasdasdmnj1312",
	}
	b := make(map[string]string)
	c := utils.MergeStringMapToUniqueSlice(a, b)

	assert.ElementsMatch(t, c, []string{"VAR1=levenTest1", "VAR2=teasdasdmnj1312"})
}

func TestMapToSliceUniqueMerger_NilB(t *testing.T) {
	a := map[string]string{
		"VAR1": "levenTest1",
		"VAR2": "teasdasdmnj1312",
	}
	var b map[string]string
	c := utils.MergeStringMapToUniqueSlice(a, b)

	assert.ElementsMatch(t, c, []string{"VAR1=levenTest1", "VAR2=teasdasdmnj1312"})
}

// values from A moved into B successfully
func TestMapToSliceUniqueMerger_NoCollision(t *testing.T) {
	a := map[string]string{
		"VAR1": "levenTest1",
		"VAR2": "teasdasdmnj1312",
	}
	b := map[string]string{
		"ALT_VAR1": "levenTest1",
		"ALT_VAR2": "teasdasdmnj1312",
	}
	c := utils.MergeStringMapToUniqueSlice(a, b)

	assert.ElementsMatch(t, c, []string{"VAR1=levenTest1", "VAR2=teasdasdmnj1312", "ALT_VAR1=levenTest1", "ALT_VAR2=teasdasdmnj1312"})
}

func TestMapToSliceUniqueMerger_Collision(t *testing.T) {
	a := map[string]string{
		"VAR1": "levenTest1",
		"VAR2": "teasdasdmnj1312",
	}
	b := map[string]string{
		"VAR1":     "CHANGE_IS_GOOD", // kha'zix
		"ALT_VAR2": "teasdasdmnj1312",
	}
	c := utils.MergeStringMapToUniqueSlice(a, b)

	assert.ElementsMatch(t, c, []string{"VAR1=CHANGE_IS_GOOD", "VAR2=teasdasdmnj1312", "ALT_VAR2=teasdasdmnj1312"})
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
	actual := utils.ReadDockerLogsFromReadCloser(reader, skip, take)

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
	actual := utils.ReadDockerLogsFromReadCloser(reader, skip, take)

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
	actual := utils.ReadDockerLogsFromReadCloser(reader, skip, take)

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
	actual := utils.ReadDockerLogsFromReadCloser(reader, skip, take)

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
	actual := utils.ReadDockerLogsFromReadCloser(reader, skip, take)

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
	actual := utils.ReadDockerLogsFromReadCloser(reader, skip, take)

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
	actual := utils.ReadDockerLogsFromReadCloser(reader, skip, take)

	assert.EqualValues(t, expected, actual)
}
