package main

import (
	_ "embed"
	"fmt"
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

type Settings struct {
	Services   ServicesType      `yaml:"services"`
	Containers ContainerSettings `yaml:"containers"`
}

type ContainerSettings struct {
	CruxEnabled   bool   `yaml:"crux_enabled"`
	CruxUiEnabled bool   `yaml:"crux-ui_enabled"`
	Network       string `yaml:"network"`
	CertVolume    string `yaml:"cert-volume"`
}

type ServicesType struct {
	Disabled []Services `yaml:"disabled"`
}

const SettingsFileName = "settings.yaml"

//go:embed "settings.yaml.example"
var content string

// Reading and parsing the settings.yaml
func ReadSettingsFile(write bool) (Settings, error) {
	examplefile := []byte(content)

	file, err := os.ReadFile(SettingsFileName)
	if err != nil {
		if write {
			err = os.WriteFile(SettingsFileName, examplefile, FilePerms)
			if err != nil {
				return Settings{}, err
			}
		}

		file, err = os.ReadFile(SettingsFileName)
		if err != nil {
			return Settings{}, err
		}
	}

	var settings Settings
	err = yaml.Unmarshal(file, settings)
	if err != nil {
		log.Fatalln(err)
	}
	return settings, nil
}

// Configuration needs some setting that only can be retrieved during runtime (like the gatweway address of the dyrectorio-stack network)
func OverwriteContainerConf(containers []Container) ([]Container, error) {
	for i := range containers {
		for j, env := range containers[i].EnvVars {
			if env.Key == "CRUX_ADDRESS" {
				gwip, err := GetCNIGateway()
				if err != nil {
					return []Container{}, err
				}
				containers[i].EnvVars[j].Value = fmt.Sprintf("%s%s", gwip, containers[i].EnvVars[j].Value)
			}
			if env.Key == "CRUX_UI_URL" {
				gwip, err := GetCNIGateway()
				if err != nil {
					return []Container{}, err
				}
				containers[i].EnvVars[j].Value = fmt.Sprintf("http://%s:3000", gwip)
			}
		}
	}

	return containers, nil
}
