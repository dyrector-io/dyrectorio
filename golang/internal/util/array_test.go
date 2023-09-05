package util_test

import (
	"testing"

	"github.com/dyrector-io/dyrectorio/golang/internal/util"

	"github.com/stretchr/testify/assert"
)

func TestContains(t *testing.T) {
	arr := []string{"as", "bs", "cs"}

	assert.True(t, util.Contains(arr, "bs"), "bs is part of the array, so it must be true")
	assert.False(t, util.Contains(arr, "xs"), "xs is not part of the array, so it must be false")
}

func TestContainsCustom(t *testing.T) {
	arr := []int{1, 2, 3, 4, 5, 6}

	intCompareFn := func(i1, i2 int) bool {
		return i1 == i2
	}

	assert.True(t, util.ContainsMatcher(arr, 6, intCompareFn))
	assert.False(t, util.ContainsMatcher(arr, 9, intCompareFn))
	assert.False(t, util.ContainsMatcher(arr, 9, nil))
}
