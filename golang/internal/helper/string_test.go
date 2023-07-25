//go:build unit
// +build unit

package helper_test

import (
	"testing"

	"github.com/dyrector-io/dyrectorio/golang/internal/helper"

	"github.com/stretchr/testify/assert"
)

func TestFirstCharacters(t *testing.T) {
	assert.Equal(t, "858ee29b2824", helper.FirstN("858ee29b28249ea83dd9430c15b4517224e46cb88aaf50ce90913be5a895500e", 12))
}

func TestFirstCharactersSmallerInputThanN(t *testing.T) {
	assert.Equal(t, "858ee", helper.FirstN("858ee", 12))
}

func TestFirstCharactersNegativeN(t *testing.T) {
	assert.Equal(t, "", helper.FirstN("858ee", -10))
}
