package main

import (
	"bufio"
	"bytes"
	_ "embed"
	"errors"
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
//go:embed "template.tmpl"
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
			container, err := GetCruxContainerDefaults()
			if err != nil {
				return []Container{}, err
			}
			containers = append(containers, container...)
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

	composeTemplate, err := template.New("container").Parse(templatefile)
	if err != nil {
		return "", err
	}

	err = composeTemplate.Execute(buffer, containers)
	if err != nil {
		return "", err
	}

	err = buffer.Flush()
	if err != nil {
		return "", err
	}

	return buf.String(), nil
}
