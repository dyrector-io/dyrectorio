package container

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"

	"github.com/docker/docker/api/types"
)

func registryAuthBase64(user, password string) string {
	if user == "" || password == "" {
		return ""
	}

	authConfig := types.AuthConfig{
		Username: user,
		Password: password,
	}
	encodedJSON, err := json.Marshal(authConfig)
	if err != nil {
		log.Println(err)
		return ""
	}
	return base64.URLEncoding.EncodeToString(encodedJSON)
}

type defaultLogger struct {
	io.StringWriter
}

func (logger defaultLogger) WriteString(s string) (int, error) {
	fmt.Println(s) //nolint
	return len(s), nil
}
