package utils

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

const dirPerm = 0o700

type SharedVariableParamError struct {
	variable string
}

func (e SharedVariableParamError) Error() string {
	return fmt.Sprintf("variable %s was empty and it is necessary for shared environment variables", e.variable)
}

func NewErrSharedVariableParamEmpty(param string) SharedVariableParamError {
	return SharedVariableParamError{variable: param}
}

func WriteSharedEnvironmentVariables(dataRoot, prefix string, in map[string]string) error {
	var err error
	err = validatePath(dataRoot, prefix)
	if err != nil {
		return err
	}

	out, err := godotenv.Marshal(in)
	if err != nil {
		return err
	}
	sharedEnvDirPath := getSharedEnvDir(dataRoot, prefix)
	sharedEnvFilePath := getSharedEnvPath(dataRoot, prefix)

	err = os.MkdirAll(sharedEnvDirPath, dirPerm)
	if err != nil {
		return err
	}

	err = os.WriteFile(sharedEnvFilePath, []byte(out), fs.ModePerm)
	if err != nil {
		return err
	}

	return nil
}

func validatePath(dataRoot, prefix string) error {
	if dataRoot == "" {
		return NewErrSharedVariableParamEmpty("dataRoot")
	} else if prefix == "" {
		return NewErrSharedVariableParamEmpty("prefix")
	}

	return nil
}

func getSharedEnvDir(dataRoot, prefix string) string {
	return filepath.Join(dataRoot, prefix)
}

func getSharedEnvPath(dataRoot, prefix string) string {
	return filepath.Join(getSharedEnvDir(dataRoot, prefix), ".shared-env")
}

func ReadSharedEnvironmentVariables(dataRoot, prefix string) (map[string]string, error) {
	var err error
	err = validatePath(dataRoot, prefix)
	if err != nil {
		return nil, err
	}
	sharedEnvPath := getSharedEnvPath(dataRoot, prefix)

	sharedEnvsFile, err := os.ReadFile(sharedEnvPath)
	if err != nil {
		return nil, err
	}

	return godotenv.UnmarshalBytes(sharedEnvsFile)
}
