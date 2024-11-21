package utils

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
	"github.com/na4ma4/go-permbits"
)

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

	err = os.MkdirAll(sharedEnvDirPath, permbits.UserAll)
	if err != nil {
		return err
	}

	err = os.WriteFile(sharedEnvFilePath, []byte(out), permbits.UserReadWrite)
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

	sharedEnvsFile, err := os.ReadFile(sharedEnvPath) // #nosec G304 -- shared-envs are generated from prefix+name and those are RFC1039
	if err != nil {
		return nil, err
	}

	return godotenv.UnmarshalBytes(sharedEnvsFile)
}
