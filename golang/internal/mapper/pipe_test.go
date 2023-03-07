package mapper_test

import (
	"reflect"
	"testing"

	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"

	"github.com/stretchr/testify/assert"
)

func TestEnvPipeSeparatedToStringMap_Empty(t *testing.T) {
	envIn := &[]string{}

	out := mapper.PipeSeparatedToStringMap(envIn)

	assert.True(t, reflect.DeepEqual(out, map[string]string{}))
}

func TestEnvPipeSeparatedToStringMap_Collision(t *testing.T) {
	envIn := &[]string{"NAME|value", "NAME|value2"}

	out := mapper.PipeSeparatedToStringMap(envIn)

	assert.True(t, reflect.DeepEqual(out, map[string]string{"NAME": "value2"}))
}
