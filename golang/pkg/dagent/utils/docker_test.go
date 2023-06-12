//go:build unit
// +build unit

package utils_test

import (
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
