package main

import (
	_ "embed"
	"io/ioutil"
	"log"

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

func ReadSettingsFile(write bool) (error, Settings) {
	examplefile := []byte(content)

	file, err := ioutil.ReadFile(SettingsFileName)
	if err != nil {
		if write {
			err := ioutil.WriteFile(SettingsFileName, examplefile, 0644)
			if err != nil {
				return err, Settings{}
			}
		}

		file, err = ioutil.ReadFile(SettingsFileName)
		if err != nil {
			return err, Settings{}
		}
	}

	var settings Settings
	err = yaml.Unmarshal(file, settings)
	if err != nil {
		log.Fatalln(err)
	}
	return nil, settings
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

func EnvVarOverwrite(settings Settings, services []Container) (error, []Container) {
	for i, container := range services {
		for j, item := range container.EnvVars {
			item = OverwriteOpt(settings, item)
			container.EnvVars[j] = item
		}
		services[i] = container
	}
	return nil, services
}
