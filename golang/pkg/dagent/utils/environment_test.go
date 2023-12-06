package utils_test

import (
	"io/fs"
	"os"
	"path/filepath"
	"testing"

	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/utils"

	"github.com/stretchr/testify/assert"
)

func TestWriteSharedEnvironmentVariables(t *testing.T) {
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
			expectedError:  utils.NewErrSharedVariableParamEmpty("dataRoot"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := utils.WriteSharedEnvironmentVariables(tt.dataRoot, tt.prefix, tt.inputVariables)
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

func TestReadSharedEnvironmentVariables(t *testing.T) {
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
			sharedEnvPath := filepath.Join(tt.dataRoot, tt.prefix, ".shared-env")
			err := os.WriteFile(sharedEnvPath, []byte(tt.fileContent), fs.ModePerm)
			assert.NoError(t, err)

			defer func() {
				removeErr := os.Remove(sharedEnvPath)
				assert.NoError(t, removeErr)
			}()

			result, err := utils.ReadSharedEnvironmentVariables(tt.dataRoot, tt.prefix)
			assert.Equal(t, tt.expectedError, err)
			assert.Equal(t, tt.expectedResult, result)
		})
	}
}
