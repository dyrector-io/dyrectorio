//go:build unit

package mapper_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
)

func TestStringMapToByteMap(t *testing.T) {
	type TestCase struct {
		initial  map[string]string
		expected map[string][]byte
	}

	cases := []TestCase{
		{
			initial: map[string]string{
				"a": "b",
			},
			expected: map[string][]byte{
				"a": []byte("b"),
			},
		},
	}

	for _, c := range cases {
		assert.EqualValues(t, c.expected, mapper.StringMapToByteMap(c.initial))
	}
}

func TestByteMapToStringMap(t *testing.T) {
	type TestCase struct {
		initial  map[string][]byte
		expected map[string]string
	}

	cases := []TestCase{
		{
			initial: map[string][]byte{
				"a": []byte("b"),
			},
			expected: map[string]string{
				"a": "b",
			},
		},
	}

	for _, c := range cases {
		assert.EqualValues(t, c.expected, mapper.ByteMapToStringMap(c.initial))
	}
}
