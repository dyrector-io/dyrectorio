package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
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

	// I refuse to spend more time to debug this OS's blasphemy
	if runtime.GOOS == "windows" {
		if compose {
			return nil, "docker-compose.exe"
		} else {
			return nil, "docker.exe"
		}
	}

	osPathList := strings.Split(osPath, string(os.PathListSeparator))

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

type PodmanNetwork struct {
	Name   string `json:"name"`
	Id     string `json:"id"`
	Driver string `json:"driver"`
	// NetIF    string   `json:"network_interface"`
	// Created  string   `json:"created"`
	Subnets []Subnet `json:"subnets"`
	// IPv6     bool     `json:"ipv6_enabled"`
	// Internal bool     `json:"internal"`
	// DNS      bool     `json:"dns_enabled"`
	// IpamOpt  IpamOpt  `json:"ipam_options"`
}

type DockerNetwork struct {
	Name   string `json:"Name"`
	Id     string `json:"Id"`
	Driver string `json:"Driver"`
	// 	Scope    string   `json:"Scope"`
	// 	Created  string   `json:"Created"`
	// 	IPv6     bool     `json:"EnableIPv6"`
	// 	Internal bool     `json:"Internal"`
	// 	Attachable
	// 	Ingress
	// 	Containers
	// 	DNS      bool     `json:"dns_enabled"`
	Ipam Ipam `json:"IPAM"`
}

type Ipam struct {
	//Driver
	//Options
	Config []Subnet
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

	namefilter := fmt.Sprintf("name=%s", ContainerNetName)

	cmd := exec.Command(executable, "network", "ls", "-f", "driver=bridge", "-f", namefilter, "--format", "'{{.Name}}'")

	cmdOutput := &bytes.Buffer{}
	cmd.Stdout = cmdOutput
	cmd.Stderr = os.Stderr

	log.Println("Executing", executable, "in the background, listing network...")
	err = cmd.Run()
	if err != nil {
		return err, ""
	}

	if cmdOutput.String() == "" {
		err = EnsureDyoNetwork(executable, true)
	}

	return GetGatewayIP(executable)
}

func GetGatewayIP(executable string) (error, string) {

	// inspect, get gw addr
	cmd := exec.Command(executable, "network", "inspect", ContainerNetName)

	cmdOutput := &bytes.Buffer{}
	cmd.Stdout = cmdOutput
	cmd.Stderr = os.Stderr

	log.Println("Executing", executable, "in the background, inspecting network...")
	err := cmd.Run()
	if err != nil {
		return err, ""
	}

	switch executable {
	case "podman.exe":
		fallthrough
	case "podman":
		var network []PodmanNetwork
		err = json.Unmarshal(cmdOutput.Bytes(), &network)
		if err != nil {
			return err, ""
		}

		if len(network) != 1 {
			return errors.New("there are more than one network"), ""
		}

		if len(network[0].Subnets) != 1 {
			return errors.New("there are more than one network subnets"), ""
		}

		gwip := network[0].Subnets[0].Gateway

		if gwip != "" {
			return nil, gwip
		}
	case "docker.exe":
		fallthrough
	case "docker":
		var network []DockerNetwork
		err = json.Unmarshal(cmdOutput.Bytes(), &network)
		if err != nil {
			return err, ""
		}

		if len(network) != 1 {
			return errors.New("there are more than one network"), ""
		}

		if len(network[0].Ipam.Config) != 1 {
			return errors.New("there are more than one network subnets"), ""
		}

		gwip := network[0].Ipam.Config[0].Gateway

		if gwip != "" {
			return nil, gwip
		}
	default:
		return errors.New("Unknown binary"), ""
	}

	return errors.New("gateway IP is empty"), ""
}

func EnsureDyoNetwork(executable string, delnet bool) error {

	namefilter := fmt.Sprintf("name=%s", ContainerNetName)

	cmd := exec.Command(executable, "network", "ls", "-f", namefilter, "--format", "'{{.Name}}'")

	cmdOutput := &bytes.Buffer{}
	cmd.Stdout = cmdOutput
	cmd.Stderr = os.Stderr

	log.Println("Executing", executable, "in the background, listing network...")
	err := cmd.Run()
	if err != nil {
		return err
	}

	if cmdOutput.String() != "" && delnet {
		//if options are fook'd we re-create the network

		cmd := exec.Command(executable, "network", "rm", ContainerNetName)

		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		log.Println("Executing", executable, "in the background, removing network...")
		err = cmd.Run()
		if err != nil {
			return err
		}

	}

	cmd = exec.Command(executable, "network", "create", ContainerNetName, "-d", "bridge")

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	log.Println("Executing", executable, "in the background, creating network...")
	err = cmd.Run()
	if err != nil {
		return err
	}
	return nil
}
