package utils

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

const dirPerm = 0o700

type PrefixFileParamError struct {
	variable string
}

func (e PrefixFileParamError) Error() string {
	return fmt.Sprintf("variable %s was empty and it is necessary for shared environment variables", e.variable)
}

func NewErrPrefixFileParamEmpty(param string) PrefixFileParamError {
	return PrefixFileParamError{variable: param}
}

type prefixFile struct {
	DataRoot string
	Prefix   string
	FileName string
}

func NewSharedEnvPrefixFile(dataRoot, prefix string) prefixFile {
	return prefixFile{
		DataRoot: dataRoot,
		Prefix:   prefix,
		FileName: ".shared-env",
	}
}

func NewSecretsPrefixFile(dataRoot, prefix string) prefixFile {
	return prefixFile{
		DataRoot: dataRoot,
		Prefix:   prefix,
		FileName: ".shared-secrets",
	}
}

func (pf *prefixFile) validatePath() error {
	if pf.DataRoot == "" {
		return NewErrPrefixFileParamEmpty("dataRoot")
	} else if pf.Prefix == "" {
		return NewErrPrefixFileParamEmpty("prefix")
	}

	return nil
}

func (pf *prefixFile) getDirectory() string {
	return filepath.Join(pf.DataRoot, pf.Prefix)
}

func (pf *prefixFile) getFilePath() string {
	return filepath.Join(pf.getDirectory(), pf.FileName)
}

func (pf *prefixFile) ReadVariables() (map[string]string, error) {
	err := pf.validatePath()
	if err != nil {
		return nil, err
	}

	filePath := pf.getFilePath()

	file, err := os.ReadFile(filePath) // #nosec G304 -- shared-envs are generated from prefix+name and those are RFC1039
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return map[string]string{}, nil
		}

		return nil, err
	}

	return godotenv.UnmarshalBytes(file)
}

func (pf *prefixFile) WriteVariables(in map[string]string) error {
	var err error
	err = pf.validatePath()
	if err != nil {
		return err
	}

	out, err := godotenv.Marshal(in)
	if err != nil {
		return err
	}
	dirPath := pf.getDirectory()
	filePath := pf.getFilePath()

	err = os.MkdirAll(dirPath, dirPerm)
	if err != nil {
		return err
	}

	err = os.WriteFile(filePath, []byte(out), fs.ModePerm)
	if err != nil {
		return err
	}

	return nil
}
