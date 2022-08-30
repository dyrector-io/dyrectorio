package main

import (
	"bytes"
	"log"
	"os/exec"
)

func RunContainers(containers string, start bool) error {
	var action string
	if start {
		action = "up"
	} else {
		action = "down"
	}

	//search for podman/docker

	cmd := exec.Command("podman-compose", action)

	stdin, err := cmd.StdinPipe()
	if err != nil {
		return err
	}

	defer stdin.Close()

	cmdOutput := &bytes.Buffer{}
	cmd.Stdout = cmdOutput
	cmdError := &bytes.Buffer{}
	cmd.Stderr = cmdError

	err = cmd.Start()
	if err != nil {
		return err
	}

	log.Println(cmdOutput.String(), cmdError.String())

	return nil
}
