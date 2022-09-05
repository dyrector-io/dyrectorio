package main

import (
	_ "embed"
	"fmt"
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

type Settings struct {
	Services     ServicesType `yaml:"services"`
	EnvOverrides []EnvVar     `yaml:"envOverrides"`
}

type ServicesType struct {
	Disabled []Services `yaml:"disabled"`
}

const SettingsFileName = "settings.yaml"

//go:embed "settings.yaml.example"
var content string

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

func OverwriteOpt(settings Settings, env EnvVar) EnvVar {
	for _, item := range settings.EnvOverrides {
		if item.Key == env.Key {
			env.Value = item.Value
			return env
		}
	}
	return env
}

func OverwriteContainerConf(containers []Container) []Container {
	for i := range containers {
		for j, env := range containers[i].EnvVars {
			if env.Key == "CRUX_ADDRESS" {
				gwip, err := GetCNIGateway()
				if err != nil {
					log.Panicln(err)
				}
				containers[i].EnvVars[j].Value = fmt.Sprintf("%s%s", gwip, containers[i].EnvVars[j].Value)
			}
		}
	}

	return containers
}

func EnvVarOverwrite(settings Settings, services []Container) []Container {
	for i := range services {
		for j, item := range services[i].EnvVars {
			item = OverwriteOpt(settings, item)
			services[i].EnvVars[j] = item
		}
	}
	return services
}
