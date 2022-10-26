package container

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"
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
		log.Error().Stack().Err(err).Msg("")
		return ""
	}
	return base64.URLEncoding.EncodeToString(encodedJSON)
}

func createCli(logger io.StringWriter) (*client.Client, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		if logger != nil && client.IsErrConnectionFailed(err) {
			_, err = logger.WriteString("Could not connect to docker socket/host.")
			if err != nil {
				fmt.Printf("Failed to write log: %s", err.Error())
			}
		}

		return nil, err
	}

	return cli, nil
}

func imageExists(ctx context.Context, logger io.StringWriter, fullyQualifiedImageName string) (bool, error) {
	cli, err := createCli(logger)
	if cli == nil {
		return false, err
	}

	filter := filters.NewArgs()
	filter.Add("reference", fullyQualifiedImageName)

	images, err := cli.ImageList(ctx, types.ImageListOptions{Filters: filter})
	if err != nil {
		if logger != nil {
			_, err = logger.WriteString("Failed to list images")
			if err != nil {
				fmt.Printf("Failed to write log: %s", err.Error())
			}
		}

		return false, err
	}

	if count := len(images); count == 1 {
		return true, nil
	} else if count > 1 {
		return false, errors.New("unexpected image count")
	}

	return false, nil
}

// force pulls the given image name
// todo(nandor-magyar): the output from docker is not really nice, should be improved
func pullImage(ctx context.Context, logger io.StringWriter, fullyQualifiedImageName, authCreds string) error {
	cli, err := createCli(logger)
	if cli == nil {
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

	var lastLog time.Time
	for {
		pullResult := ImagePullResponse{}
		err = d.Decode(&pullResult)
		if err == io.EOF {
			err = nil
			break
		} else if err != nil {
			log.Error().Stack().Err(err).Msg("decode error")
			break
		}

		if logger != nil && time.Since(lastLog) > time.Second {
			var logErr error
			if pullResult.ProgressDetail.Current != 0 && pullResult.ProgressDetail.Total != 0 {
				_, logErr = logger.WriteString(
					fmt.Sprintf("Image: %s %s  %0.2f%%",
						pullResult.ID,
						pullResult.Status,
						float64(pullResult.ProgressDetail.Current)/float64(pullResult.ProgressDetail.Total)*100)) //nolint:gomnd
				lastLog = time.Now()
			} else {
				_, logErr = logger.WriteString(fmt.Sprintf("Image: %s %s", pullResult.ID, pullResult.Status))
				lastLog = time.Now()
			}
			if logErr != nil {
				fmt.Printf("Failed to write log: %s", logErr.Error())
			}
		}
	}

	return err
}

func deleteContainer(ctx context.Context, containerName string) error {
	deletableContainer, err := getContainer(ctx, containerName)
	if err != nil {
		return fmt.Errorf("builder could not get container (%s) to remove: %s", containerName, err.Error())
	}

	switch deletableContainer.State {
	case "running", "paused", "restarting":
		if err = stopContainer(ctx, containerName); err != nil {
			return fmt.Errorf("builder could not stop container (%s): %s", containerName, err.Error())
		}
		fallthrough
	case "exited", "dead", "created":
		if err = removeContainer(ctx, containerName); err != nil {
			return fmt.Errorf("builder could not remove container (%s): %s", containerName, err.Error())
		}
		return nil
	case "":
		// when there's no container we just skip it
		return nil
	default:
		return fmt.Errorf("builder could not determine the state (%s) of the container (%s) for deletion: %s",
			deletableContainer.State,
			containerName,
			err.Error())
	}
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

// Check the existence of a container, then return it, matches only one
func getContainer(ctx context.Context, containerName string) (types.Container, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	filter := filters.NewArgs()
	filter.Add("name", fmt.Sprintf("^%s$", containerName))

	containers, err := cli.ContainerList(ctx, types.ContainerListOptions{All: true, Filters: filter})
	if err != nil {
		return types.Container{}, err
	}

	switch len(containers) {
	case 0:
		// when we didn't matched any
		return types.Container{}, nil
	case 1:
		return containers[0], nil
	default:
		// can not happen, as there would be multiple containers under the same name
		return types.Container{}, fmt.Errorf("unreachable error, exact matching failed")
	}
}

func deleteNetwork(ctx context.Context, networkID string) error {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	return cli.NetworkRemove(ctx, networkID)
}

type defaultLogger struct {
	io.StringWriter
}

func (logger *defaultLogger) WriteString(s string) (int, error) {
	fmt.Println(s)
	return len(s), nil
}
