package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"os/exec"
	"runtime"
	"strings"
)

const ContainerNetName = "dyo-cli"

const OSwindows = "windows"
const ExecPodman = "podman"
const ExecPodmanCompose = "podman-compose"

const ExecDocker = "docker"
const ExecDockerCompose = "docker-compose"
const ExecWinDocker = "docker.exe"
const ExecWinDockerCompose = "docker-compose.exe"

// Start compose file
func RunContainers(start, quiet bool) error {
	// search for podman/docker
	executable, err := FindExec(true)
	if err != nil {
		return err
	}

	var cmd *exec.Cmd
	if start {
		cmd = exec.Command(executable, "up", "-d")
	} else {
		cmd = exec.Command(executable, "down")
	}

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	log.Println("Executing", executable, "in the background...")
	err = cmd.Run()
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
func FindExec(compose bool) (executable string, errormsg error) {
	// I refuse to spend more time to debug this OS's blasphemy
	if runtime.GOOS == OSwindows {
		if compose {
			return ExecWinDockerCompose, nil
		} else {
			return ExecWinDocker, nil
		}
	}

	executables, err := exploreOSPaths()
	if err != nil {
		return "", err
	}

	dockerComposePresent := false
	dockerPresent := false
	for _, file := range executables {
		switch file {
		case ExecPodmanCompose:
			if compose {
				return ExecPodmanCompose, nil
			}
		case ExecDockerCompose:
			dockerComposePresent = true
		case ExecPodman:
			if !compose {
				return ExecPodman, nil
			}
		case ExecDocker:
			dockerPresent = true
		}
	}

	if compose {
		if dockerComposePresent {
			return ExecDockerCompose, nil
		}
	} else {
		if dockerPresent {
			return ExecDocker, nil
		}
	}

	return "", errors.New("executable not found")
}

// Collect all executable names from OS's PATHs
func exploreOSPaths() ([]string, error) {
	osPath := os.Getenv("PATH")
	osPathList := strings.Split(osPath, string(os.PathListSeparator))

	var executables []string

	for _, path := range osPathList {
		files, err := os.ReadDir(path)
		if err != nil {
			return []string{}, err
		}

		for _, f := range files {
			executables = append(executables, f.Name())
		}
	}

	return executables, nil
}

// Minimal configuration to parse podman networks
type PodmanNetwork struct {
	Name    string   `json:"name"`
	ID      string   `json:"id"`
	Driver  string   `json:"driver"`
	Subnets []Subnet `json:"subnets"`
}

type Subnet struct {
	Subnet  string `json:"subnet"`
	Gateway string `json:"gateway"`
}

// Minimal configuration to parse docker networks
type DockerNetwork struct {
	Name   string `json:"Name"`
	ID     string `json:"Id"`
	Driver string `json:"Driver"`
	Ipam   Ipam   `json:"IPAM"`
}

type Ipam struct {
	Config []Subnet
}

// Retrieving docker networks gateway IP
func GetCNIGateway() (string, error) {
	executable, err := FindExec(false)
	if err != nil {
		return "", err
	}

	namefilter := fmt.Sprintf("name=%s", ContainerNetName)
	cmd := exec.Command(executable, "network", "ls", "-f", "driver=bridge", "-f", namefilter, "--format", "'{{.Name}}'")

	cmdOutput := &bytes.Buffer{}
	cmd.Stdout = cmdOutput
	cmd.Stderr = os.Stderr

	log.Println("Executing", executable, "in the background, listing network...")
	err = cmd.Run()
	if err != nil {
		return "", err
	}

	if cmdOutput.String() == "" {
		if EnsureDyoNetwork(executable, true) != nil {
			return "", err
		}
	}

	return GetGatewayIP(executable)
}

// Extract the docker network gateway IP from cli output
func GetGatewayIP(executable string) (string, error) {
	cmd := exec.Command(executable, "network", "inspect", ContainerNetName)

	cmdOutput := &bytes.Buffer{}
	cmd.Stdout = cmdOutput
	cmd.Stderr = os.Stderr

	log.Println("Executing", executable, "in the background, inspecting network...")
	err := cmd.Run()
	if err != nil {
		return "", err
	}

	switch executable {
	case ExecPodman:
		var network []PodmanNetwork
		err = json.Unmarshal(cmdOutput.Bytes(), &network)
		if err != nil {
			return "", err
		}

		if len(network) != 1 {
			return "", errors.New("there are more than one network")
		}

		if len(network[0].Subnets) != 1 {
			return "", errors.New("there are more than one network subnets")
		}

		gwip := network[0].Subnets[0].Gateway

		if gwip != "" {
			return gwip, nil
		}

	case ExecDocker, ExecWinDocker:
		var network []DockerNetwork
		err = json.Unmarshal(cmdOutput.Bytes(), &network)
		if err != nil {
			return "", err
		}

		if len(network) != 1 {
			return "", errors.New("there are more than one network")
		}

		if len(network[0].Ipam.Config) != 1 {
			return "", errors.New("there are more than one network subnets")
		}

		gwip := network[0].Ipam.Config[0].Gateway

		if gwip != "" {
			return gwip, nil
		}

	default:
		return "", errors.New("unknown binary")
	}

	return "", errors.New("gateway IP is empty")
}

// Make sure dyo-cli network is exists and has correct settings
func EnsureDyoNetwork(executable string, delnet bool) error {
	namefilter := fmt.Sprintf("name=%s", ContainerNetName)
	lscmd := exec.Command(executable, "network", "ls", "-f", namefilter, "--format", "'{{.Name}}'")

	lscmdOutput := &bytes.Buffer{}
	lscmd.Stdout = lscmdOutput
	lscmd.Stderr = os.Stderr

	log.Println("Executing", executable, "in the background, listing network...")
	err := lscmd.Run()
	if err != nil {
		return err
	}

	if lscmdOutput.String() != "" && delnet {
		// If options are not ideal we re-create the network
		rmcmd := exec.Command(executable, "network", "rm", ContainerNetName)

		rmcmd.Stdout = os.Stdout
		rmcmd.Stderr = os.Stderr

		log.Println("Executing", executable, "in the background, removing network...")
		err = rmcmd.Run()
		if err != nil {
			return err
		}
	}

	createcmd := exec.Command(executable, "network", "create", ContainerNetName, "-d", "bridge")

	createcmd.Stdout = os.Stdout
	createcmd.Stderr = os.Stderr

	log.Println("Executing", executable, "in the background, creating network...")
	err = createcmd.Run()
	if err != nil {
		return err
	}
	return nil
}
