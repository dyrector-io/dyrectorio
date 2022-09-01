package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"runtime"
	"strings"
)

const ContainerNetName = "dyocli"

func RunContainers(containers string, start bool, quiet bool) error {

	//search for podman/docker
	err, executable := findExec(true)
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

// Find a compose executable
func findExec(compose bool) (error, string) {
	osPath := os.Getenv("PATH")

	separator := ":"
	if runtime.GOOS == "windows" {
		separator = ";"
	}

	osPathList := strings.Split(osPath, separator)

	podmanPresent := false
	dockerPresent := false

	for _, path := range osPathList {
		files, err := ioutil.ReadDir(path)
		if err != nil {
			return err, ""
		}

		for _, f := range files {
			if compose {
				switch f.Name() {
				case "podman-compose":
					podmanPresent = true
				case "docker-compose":
					dockerPresent = true
				}
			} else {
				switch f.Name() {
				case "podman":
					podmanPresent = true
				case "docker":
					dockerPresent = true
				}
			}
		}
	}

	//podman takes precedence
	if compose {
		if podmanPresent {
			return nil, "podman-compose"
		}
		if dockerPresent {
			return nil, "docker-compose"
		}
	} else {
		if podmanPresent {
			return nil, "podman"
		}
		if dockerPresent {
			return nil, "docker"
		}
	}

	return errors.New("executable not found"), ""
}

type DockerNetwork struct {
	Name     string   `json:"name"`
	Id       string   `json:"id"`
	Driver   string   `json:"driver"`
	NetIF    string   `json:"network_interface"`
	Created  string   `json:"created"`
	Subnets  []Subnet `json:"subnets"`
	IPv6     bool     `json:"ipv6_enabled"`
	Internal bool     `json:"internal"`
	DNS      bool     `json:"dns_enabled"`
	IpamOpt  IpamOpt  `json:"ipam_options"`
}

type Subnet struct {
	Subnet  string `json:"subnet"`
	Gateway string `json:"gateway"`
}
type IpamOpt struct {
	Driver string `json:"driver"`
}

func GetCNIGateway() (error, string) {
	//get networks

	err, executable := findExec(false)
	if err != nil {
		return err, ""
	}

	cmd := exec.Command(executable, "network", "ls", "-q")

	cmdOutput := &bytes.Buffer{}
	cmd.Stdout = cmdOutput
	cmd.Stderr = os.Stderr

	log.Println("Executing", executable, "in the background, listing network...")
	err = cmd.Run()
	if err != nil {
		return err, ""
	}

	nets := strings.Split(cmdOutput.String(), "\n")

	for i, item := range nets {
		if item == ContainerNetName {
			break
		}
		// if dyocli doesn't exist or in bridge, create one
		if i == len(nets)-1 {
			err = CreateContainerNetwork(false)
			if err != nil {
				return err, ""
			}
		}
	}

	// inspect, get gw addr
	cmd = exec.Command(executable, "network", "inspect", ContainerNetName)

	cmdOutput = &bytes.Buffer{}
	cmd.Stdout = cmdOutput
	cmd.Stderr = os.Stderr

	log.Println("Executing", executable, "in the background, inspecting network...")
	err = cmd.Run()
	if err != nil {
		return err, ""
	}

	var network []DockerNetwork
	err = json.Unmarshal(cmdOutput.Bytes(), &network)
	if err != nil {
		return err, ""
	}

	if len(network) != 1 {
		return errors.New("there are more than one network"), ""
	}

	// network should be bridge otherwise recreate
	if network[0].Driver != "bridge" {
		err = CreateContainerNetwork(true)
		if err != nil {
			return err, ""
		}
	}

	if len(network[0].Subnets) != 1 {
		return errors.New("there are more than one network subnets"), ""
	}

	gwip := network[0].Subnets[0].Gateway

	if gwip != "" {
		return nil, gwip
	}

	return errors.New("gateway IP is empty"), ""
}

func CreateContainerNetwork(delnet bool) error {
	err, executable := findExec(false)
	if err != nil {
		return err
	}

	//if options are fook'd we re-create the network
	if delnet {
		cmd := exec.Command(executable, "network", "rm", ContainerNetName)

		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		log.Println("Executing", executable, "in the background, removing network...")
		err = cmd.Run()
		if err != nil {
			return err
		}
	}

	cmd := exec.Command(executable, "network", "create", ContainerNetName)

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	log.Println("Executing", executable, "in the background, creating network...")
	err = cmd.Run()
	if err != nil {
		return err
	}
	return nil
}
