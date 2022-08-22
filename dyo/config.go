package main

import (
	"io/ioutil"
	"log"

	"gopkg.in/yaml.v3"
)

type Settings struct {
	Services     ServicesType `yaml:"services"`
	EnvOverrides []EnvVar     `yaml:"envOverrides"`
}

type ServicesType struct {
	Disabled []ServiceName `yaml:"disabled"`
}

var Cfg Settings

func ReadConfig() {
	examplefile := []byte(`# services:
  # disabled:
  # - crux
  # - cruxui
  # envOverrides:
    # -
      # variable: TZ
      # value: Europe/Budapest
`)

	file, err := ioutil.ReadFile("settings.yaml")
	if err != nil {
		err := ioutil.WriteFile("settings.yaml", examplefile, 0644)
		if err != nil {
			log.Fatalln(err)
		}
		file, err = ioutil.ReadFile("settings.yaml")
		if err != nil {
			log.Fatalln(err)
		}
	}

	err = yaml.Unmarshal(file, &Cfg)
	if err != nil {
		log.Fatalln(err)
	}
}

func OverwriteOpt(env EnvVar) EnvVar {
	for _, item := range Cfg.EnvOverrides {
		if item.Key == env.Key {
			env.Value = item.Value
			return env
		}
	}
	return env
}

func EnvVarOverwrite(services []Container) (error, []Container) {
	for i, container := range services {
		for j, item := range container.EnvVars {
			item = OverwriteOpt(item)
			container.EnvVars[j] = item
		}
		services[i] = container
	}
	return nil, services
}
