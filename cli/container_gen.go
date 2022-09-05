package main

import (
	"bufio"
	"bytes"
	_ "embed"
	"errors"
	"os"
	"text/template"
)

// Container template's subtype
type Volume struct {
	Host      string
	Container string
	RO        bool
}

// Container template's subtype
type Port struct {
	Host      int
	Container int
}

// Container template's subtype
type EnvVar struct {
	Key   string `yaml:"variable"`
	Value string `yaml:"value"`
}

// Generating a container template
type Container struct {
	Enabled bool
	Image   string
	Name    string
	EnvVars []EnvVar
	Volumes []Volume
	Depends []string
	Ports   []Port
	Restart bool
	Command string
}

// template file
//
//go:embed "template.hbr"
var templatefile string

// Container services
type Services string

// Go's idea about enums :c
const (
	CruxUI Services = "crux-ui"
	Crux   Services = "crux"
	Utils  Services = "utils"
)

const FilePerms = 0600

// Return compiled containers from given services
func GetContainerDefaults(services []Services) ([]Container, error) {
	var containers []Container

	for _, i := range services {
		switch i {
		case CruxUI:
			containers = append(containers, GetCruxuiContainerDefaults()...)
		case Crux:
			containers = append(containers, GetCruxContainerDefaults()...)
		case Utils:
			containers = append(containers, GetUtilsContainerDefaults()...)
		default:
			return []Container{}, errors.New("invalid service name")
		}
	}

	return containers, nil
}

// Generate container settings based on selected services
func GenContainer(services []Services, write bool) (string, error) {
	containers, err := GetContainerDefaults(services)
	if err != nil {
		return "", err
	}

	if write {
		var settings Settings
		settings, err = ReadSettingsFile(true)
		if err != nil {
			return "", err
		}
		containers = EnvVarOverwrite(settings, containers)
	}

	buf := bytes.Buffer{}
	buffer := bufio.NewWriter(&buf)

	composetemplate, err := template.New("container").Parse(templatefile)
	if err != nil {
		return "", err
	}

	err = composetemplate.Execute(buffer, containers)
	if err != nil {
		return "", err
	}

	err = buffer.Flush()
	if err != nil {
		return "", err
	}

	return buf.String(), nil
}

// Write out compose file
func WriteComposeFile(containers string) error {
	err := os.WriteFile("docker-compose.yaml", []byte(containers), FilePerms)
	return err
}
