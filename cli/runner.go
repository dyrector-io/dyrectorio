package main

import (
	"context"
	"log"
	"os"
	"os/exec"
	"runtime"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
)

const ContainerNetName = "dyrectorio-stack"

const OSwindows = "windows"
const ExecPodman = "podman"

const ExecDocker = "docker"
const ExecDockerCompose = "docker-compose"
const ExecWinDocker = "docker.exe"
const ExecWinDockerCompose = "docker-compose.exe"

const ContainerNetDriver = "bridge"

// Start compose file
func RunContainers(start, quiet bool) error {
	// search for podman/docker
	executable := FindExec(true)

	var cmd *exec.Cmd
	if start {
		cmd = exec.Command(executable, "up", "-d")
	} else {
		cmd = exec.Command(executable, "down")
	}

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	log.Println("Executing", executable, "in the background...")
	err := cmd.Run()
	if err != nil {
		return err
	}

	// if we want "silent" output we exit early
	if quiet {
		return nil
	}

	// otherwise see logs
	log.Println("Printing logs:")
	cmd = exec.Command(executable, "logs", "-f")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err = cmd.Run()
	if err != nil {
		return err
	}

	return nil
}

// Find a compose or docker executable, prioritizing podman
func FindExec(compose bool) (executable string) {
	// I refuse to spend more time to debug this OS's blasphemy
	if runtime.GOOS == OSwindows {
		if compose {
			return ExecWinDockerCompose
		} else {
			return ExecWinDocker
		}
	}

	if compose {
		return ExecDockerCompose
	} else {
		return ExecDocker
	}
}

// Retrieving docker networks gateway IP
func GetCNIGateway() (string, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	networks, err := cli.NetworkList(context.Background(),
		types.NetworkListOptions{
			Filters: filters.NewArgs(
				filters.Arg("Name", ContainerNetName),
				filters.Arg("Driver", ContainerNetDriver))})
	//Name: ContainerNetName, Driver: ContainerNetDriver})
	if err != nil {
		return "", err
	}

	for _, net := range networks {
		if net.Name == ContainerNetName {
			if net.Driver != ContainerNetDriver {
				log.Panicln("network with", ContainerNetName, "name exist, but the driver is not bridge")
			}
		} else {

			opts := types.NetworkCreate{
				Driver: ContainerNetDriver,
			}

			resp, err := cli.NetworkCreate(context.Background(), ContainerNetName, opts)
			log.Println(resp.ID, resp.Warning)
			if err != nil {
				return "", err
			}
		}

	}

	networks, err = cli.NetworkList(context.Background(),
		types.NetworkListOptions{
			Filters: filters.NewArgs(
				filters.Arg("Name", ContainerNetName),
				filters.Arg("Driver", ContainerNetDriver))})

	if err != nil {
		return "", err
	}
	if len(networks) != 1 {
		log.Panicln("network error")
	} else {
		if len(networks[0].IPAM.Config) != 1 {
			log.Panicln("network subnet error")
		}
	}

	return networks[0].IPAM.Config[0].Gateway, nil
}
