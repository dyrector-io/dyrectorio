package main

import (
	"errors"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"strings"
)

func RunContainers(containers string, start bool, quiet bool) error {

	//search for podman/docker
	err, executable := findComposeExec()
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
	err = cmd.Start()
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

	err = cmd.Start()
	if err != nil {
		return err
	}

	return nil
}

// Find a compose executable
func findComposeExec() (error, string) {
	osPath := os.Getenv("PATH")

	osPathList := strings.Split(osPath, ":")

	podmanPresent := false
	dockerPresent := false

	for _, path := range osPathList {
		files, err := ioutil.ReadDir(path)
		if err != nil {
			return err, ""
		}

		for _, f := range files {
			switch f.Name() {
			case "podman-compose":
				podmanPresent = true
			case "docker-compose":
				dockerPresent = true
			}
		}
	}

	//podman takes precedence
	if podmanPresent {
		return nil, "podman-compose"
	}
	if dockerPresent {
		return nil, "docker-compose"
	}

	return errors.New("compose executable not found"), ""
}
