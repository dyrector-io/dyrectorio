package util_test

import (
	"testing"

	"github.com/dyrector-io/dyrectorio/golang/internal/util"

	"github.com/stretchr/testify/assert"
)

func TestContaints(t *testing.T) {
	arr := []string{"as", "bs", "cs"}

	assert.True(t, util.Contains(arr, "bs"), "bs is part of the array, so it must be true")
	assert.False(t, util.Contains(arr, "xs"), "xs is not part of the array, so it must be false")
}
