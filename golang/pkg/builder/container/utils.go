package container

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"

	"github.com/docker/docker/api/types"

	"github.com/rs/zerolog/log"
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
		log.Error().Err(err).Msg("Failed to encode json")
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
