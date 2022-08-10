package container

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
)

const dockerClientTimeoutSeconds = 30

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

// force pulls the given image name
func pullImage(ctx context.Context, logger io.StringWriter, fullyQualifiedImageName, authCreds string) error {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())

	if err != nil {
		if logger != nil && client.IsErrConnectionFailed(err) {
			_, err = logger.WriteString("Could not connect to docker socket/host.")
			if err != nil {
				fmt.Printf("Failed to write log: %s", err.Error())
			}
		}

		return err
	}

	if logger != nil {
		_, err = logger.WriteString("Pulling image: " + fullyQualifiedImageName)
		if err != nil {
			fmt.Printf("Failed to write log: %s", err.Error())
		}
	}

	reader, err := cli.ImagePull(ctx, fullyQualifiedImageName, types.ImagePullOptions{RegistryAuth: authCreds})
	if err != nil {
		return err
	}
	defer reader.Close()

	d := json.NewDecoder(reader)

	for {
		pullResult := ImagePullResponse{}
		err = d.Decode(&pullResult)
		if err == io.EOF {
			break
		} else if err != nil {
			log.Println("decode error: " + err.Error())
			break
		}

		if logger != nil {
			var logErr error
			if pullResult.ProgressDetail.Current != 0 && pullResult.ProgressDetail.Total != 0 {
				_, logErr = logger.WriteString(
					fmt.Sprintf("Image: %s %s  %0.2f%%",
						pullResult.ID,
						pullResult.Status,
						float64(pullResult.ProgressDetail.Current)/float64(pullResult.ProgressDetail.Total)*100)) //nolint:gomnd
			} else {
				_, logErr = logger.WriteString(fmt.Sprintf("Image: %s %s", pullResult.ID, pullResult.Status))
			}
			if logErr != nil {
				fmt.Printf("Failed to write log: %s", logErr.Error())
			}
		}
		time.Sleep(time.Second)
	}

	return err
}

func deleteContainer(ctx context.Context, containerName string) error {
	if err := stopContainer(ctx, containerName); err != nil {
		return err
	}

	if err := removeContainer(ctx, containerName); err != nil {
		return err
	}

	return nil
}

func stopContainer(ctx context.Context, containerName string) error {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	timeoutValue := (time.Duration(dockerClientTimeoutSeconds) * time.Second)
	if err := cli.ContainerStop(ctx, containerName, &timeoutValue); err != nil {
		return err
	}

	return nil
}

func removeContainer(ctx context.Context, containerName string) error {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	if err := cli.ContainerRemove(ctx, containerName, types.ContainerRemoveOptions{}); err != nil {
		return err
	}

	return nil
}

type defaultLogger struct {
	io.StringWriter
}

func (logger *defaultLogger) WriteString(s string) (int, error) {
	fmt.Println(s)
	return len(s), nil
}
