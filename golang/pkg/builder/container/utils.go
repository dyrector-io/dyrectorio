package container

import (
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"

	"github.com/docker/docker/api/types"
	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"

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
	dogger.LogWriter
}

func (logger defaultLogger) WriteString(s string) (int, error) {
	fmt.Println(s) //nolint
	return len(s), nil
}

func ReadDockerLogsFromReadCloser(logs io.ReadCloser, skip, take int) []string {
	output := make([]string, 0)
	eofReached := false

	// [8]byte{STREAM_TYPE, 0, 0, 0, SIZE1, SIZE2, SIZE3, SIZE4}[]byte{OUTPUT}
	//
	// STREAM_TYPE can be 1 for stdout and 2 for stderr
	//
	// SIZE1, SIZE2, SIZE3, and SIZE4 are four bytes of uint32 encoded as big endian.
	// This is the size of OUTPUT.
	//
	// for more info see: docker's Client.ContainerLogs()
	const headerSize = 8
	header := make([]byte, headerSize)
	for !eofReached {
		_, err := logs.Read(header)
		if err != nil {
			if err != io.EOF {
				panic(err)
			}

			break
		}

		count := binary.BigEndian.Uint32(header[4:])
		data := make([]byte, count)
		_, err = logs.Read(data)

		if err != nil {
			if err != io.EOF {
				panic(err)
			}

			eofReached = true
		}

		output = append(output, string(data))
	}

	if skip == 0 && take == 0 {
		return output
	}

	length := len(output)
	skip = length - skip
	if skip < 0 {
		skip = 0
	}

	take = skip - take
	if take < 0 {
		take = 0
	}

	return output[take:skip]
}
