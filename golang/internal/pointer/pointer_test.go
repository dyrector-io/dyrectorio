package pointer

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewPTR(t *testing.T) {
	sPtr := NewPTR[string]("")
	assert.Equal(t, *sPtr, "")

	iPtr := NewPTR[int](120)
	assert.Equal(t, *iPtr, 120)
}
