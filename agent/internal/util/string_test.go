package util_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/agent/internal/util"
)

func TestJoinV(t *testing.T) {
	assert.Equal(t, util.JoinV(""), "")
	assert.Equal(t, util.JoinV(":", "o", "o"), "o:o")
	assert.Equal(t, util.JoinV("\\", "i"), "i")
	assert.Equal(t, util.JoinV("/", "i", "i", "i"), "i/i/i")
}

func TestFallback(t *testing.T) {
	assert.Equal(t, util.Fallback(""), "")
	assert.Equal(t, util.Fallback("1", "2", "3"), "1")
	assert.Equal(t, util.Fallback("", "2"), "2")
	assert.Equal(t, util.Fallback("", "", "", "4"), "4")
}
