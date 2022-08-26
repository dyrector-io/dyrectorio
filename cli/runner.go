package main

import (
	"bytes"
	"log"
	"os/exec"
	"strings"
)

func RunContainers(containers string, start bool) error {
	cmd := exec.Command("podman-compose", "up")

	input := strings.NewReader(containers)
	cmd.Stdin = input
	cmdOutput := &bytes.Buffer{}
	cmd.Stdout = cmdOutput
	cmdError := &bytes.Buffer{}
	cmd.Stderr = cmdError

	err := cmd.Run()
	if err != nil {
		log.Println(string(cmdOutput.Bytes()), string(cmdError.Bytes()))
		return err
	}

	return nil
}
