//go:build unit
// +build unit

package utils_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/utils"
	"github.com/na4ma4/go-permbits"

	"github.com/stretchr/testify/assert"
)

func TestWriteVariables(t *testing.T) {
	tests := []struct {
		name           string
		dataRoot       string
		prefix         string
		instanceName   string
		inputVariables map[string]string
		expectedError  error
	}{
		{
			name:           "ValidInputs",
			dataRoot:       os.TempDir(),
			prefix:         "prefix",
			instanceName:   "instance",
			inputVariables: map[string]string{"key1": "value1", "key2": "value2"},
			expectedError:  nil,
		},
		{
			name:           "EmptyDataRoot",
			dataRoot:       "",
			prefix:         "prefix",
			instanceName:   "instance",
			inputVariables: map[string]string{"key1": "value1", "key2": "value2"},
			expectedError:  utils.NewErrPrefixFileParamEmpty("dataRoot"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			pf := utils.NewSharedEnvPrefixFile(tt.dataRoot, tt.prefix)

			err := pf.WriteVariables(tt.inputVariables)
			assert.Equal(t, tt.expectedError, err)

			if err == nil {
				sharedEnvPath := filepath.Join(tt.dataRoot, tt.prefix, ".shared-env")
				_, err := os.Stat(sharedEnvPath)
				assert.NoError(t, err)

				defer func() {
					err := os.Remove(sharedEnvPath)
					assert.NoError(t, err)
				}()
			}
		})
	}
}

func TestReadVariables(t *testing.T) {
	tests := []struct {
		name           string
		dataRoot       string
		prefix         string
		fileContent    string
		expectedResult map[string]string
		expectedError  error
	}{
		{
			name:           "ValidFile",
			dataRoot:       os.TempDir(),
			prefix:         "prefix",
			fileContent:    "key1=value1\nkey2=value2",
			expectedResult: map[string]string{"key1": "value1", "key2": "value2"},
			expectedError:  nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			pf := utils.NewSharedEnvPrefixFile(tt.dataRoot, tt.prefix)

			sharedEnvPath := filepath.Join(tt.dataRoot, tt.prefix, ".shared-env")
			err := os.WriteFile(sharedEnvPath, []byte(tt.fileContent), permbits.UserReadWrite)
			assert.NoError(t, err)

			defer func() {
				removeErr := os.Remove(sharedEnvPath)
				assert.NoError(t, removeErr)
			}()

			result, err := pf.ReadVariables()
			assert.Equal(t, tt.expectedError, err)
			assert.Equal(t, tt.expectedResult, result)
		})
	}
}
