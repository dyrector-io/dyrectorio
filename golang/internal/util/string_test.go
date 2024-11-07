package util_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/golang/internal/util"
)

func TestJoinV(t *testing.T) {
	assert.Equal(t, "", util.JoinV(""))
	assert.Equal(t, "o:o", util.JoinV(":", "o", "o"))
	assert.Equal(t, "i", util.JoinV("\\", "i"))
	assert.Equal(t, "i/i/i", util.JoinV("/", "i", "i", "i"))
	assert.Equal(t, "ENVKEY", util.JoinV("=", "ENVKEY", "")) // this is intentionally a bad example
}

func TestJoinVEmpty(t *testing.T) {
	assert.Equal(t, "ENVKEY=", util.JoinVEmpty("=", "ENVKEY", "")) // this is intentionally a bad example
}

func TestFallback(t *testing.T) {
	assert.Equal(t, "", util.Fallback(""))
	assert.Equal(t, "1", util.Fallback("1", "2", "3"))
	assert.Equal(t, "2", util.Fallback("", "2"))
	assert.Equal(t, "4", util.Fallback("", "", "", "4"))
}
