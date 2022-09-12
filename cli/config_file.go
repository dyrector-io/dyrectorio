package main

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
)

// Settings and state of the application
type Settings struct {
	SettingsFile     SettingsFile
	SettingsWrite    bool
	SettingsExists   bool
	SettingsFilePath string
	Command          string
	CruxDisabled     bool
	CruxUIDisabled   bool
	NetworkGatewayIP string
	Crux             ContainerSettings
	CruxUI           ContainerSettings
	Kratos           ContainerSettings
}

type ContainerSettings struct {
	Image    string
	CruxAddr string
}

// Settings file will be read/written as this struct
type SettingsFile struct {
	// version as in image tag like "latest" or "stable"
	Version        string `yaml:"version"`
	CruxDisabled   bool   `yaml:"crux_disabled"`
	CruxUIDisabled bool   `yaml:"crux-ui_disabled"`
	Network        string `yaml:"network-name"`
	Prefix         string `yaml:"prefix"`
	Options
}

type Options struct {
	TimeZone               string `yaml:"timezone"`
	CruxAgentGrpcPort      uint   `yaml:"crux-agentgrpc-port"`
	CruxGrpcPort           uint   `yaml:"crux-grpc-port"`
	CruxUIPort             uint   `yaml:"crux-ui-port"`
	CruxSecret             string `yaml:"crux-secret"`
	CruxPostgresPort       uint   `yaml:"cruxPostgresPort"`
	CruxPostgresDB         string `yaml:"cruxPostgresDB"`
	CruxPostgresUser       string `yaml:"cruxPostgresUser"`
	CruxPostgresPassword   string `yaml:"cruxPostgresPassword"`
	KratosAdminPort        uint   `yaml:"kratosAdminPort"`
	KratosPublicPort       uint   `yaml:"kratosPublicPort"`
	KratosPostgresPort     uint   `yaml:"kratosPostgresPort"`
	KratosPostgresDB       string `yaml:"kratosPostgresDB"`
	KratosPostgresUser     string `yaml:"kratosPostgresUser"`
	KratosPostgresPassword string `yaml:"kratosPostgresPassword"`
	KratosSecret           string `yaml:"kratosSecret"`
	MailSlurperPort        uint   `yaml:"mailSlurperPort"`
}

const DefaultPostgresPort = 5432

const DefaultCruxAgentGrpcPort = 5000
const DefaultCruxGrpcPort = 5001
const DefaultCruxUIPort = 3000
const DefaultCruxPostgresPort = 5432
const DefaultKratosAdminPort = 4433
const DefaultKratosPublicPort = 4434
const DefaultKratosPostgresPort = 5433
const DefaultMailSlurperPort = 4436

const SecretLength = 32

const bufferMultiplier = 2

const FilePerms = 0600
const DirPerms = 0750

const SettingsFileName = "settings.yaml"
const SettingsFileDir = "dyo"

// Check if the settings file is exists
func SettingsExists(settingspath string) bool {
	settingsfilepath := SettingsFileLocation(settingspath)

	if _, err := os.Stat(settingsfilepath); err == nil {
		return true
	} else if errors.Is(err, os.ErrNotExist) {
		return false
	} else {
		log.Fatalf("%s", err)
		return false
	}
}

// Assemble the location of the settings file
func SettingsFileLocation(settingspath string) string {
	if settingspath == "" {
		userconfdir, err := os.UserConfigDir()
		if err != nil {
			log.Fatalf("Couldn't determine the user's configuration dir: %s", err)
		}
		settingspath = fmt.Sprintf("%s/%s/%s", userconfdir, SettingsFileDir, SettingsFileName)
	}

	return settingspath
}

// Reading and parsing the settings.yaml
func SettingsFileReadWrite(state Settings) Settings {
	if !state.SettingsExists {
		state.SettingsWrite = true
	} else {
		filedata, err := os.ReadFile(state.SettingsFilePath)
		if err != nil {
			log.Fatalf("%v", err)
		}
		err = yaml.Unmarshal(filedata, &state.SettingsFile)
		if err != nil {
			log.Fatalf("error: %v", err)
		}
	}

	// Fill out data if empty
	settings := LoadDefaultsOnEmpty(state)

	settings = GetNetworkGatewayIP(settings, EnsureNetworkExists(settings))

	// Set disabled stuff
	settings = DisabledServiceSettings(settings)

	// Settings Validation steps

	// TODO: Check for available ports

	saveSettings(settings)

	log.Printf("%v", settings)

	return settings
}

func DisabledServiceSettings(settings Settings) Settings {
	if settings.CruxDisabled {
		fmt.Printf("Do not forget to add your DATABASE_URL to your crux environment.\n\n")
		fmt.Printf("DATABASE_URL=postgresql://%s:%s@%s_crux-postgres:%d/%s?schema=public\n\n",
			settings.SettingsFile.CruxPostgresUser,
			settings.SettingsFile.CruxPostgresPassword,
			settings.SettingsFile.Prefix,
			settings.SettingsFile.CruxPostgresPort,
			settings.SettingsFile.CruxPostgresDB)
	}

	if settings.CruxUIDisabled {
		settings.CruxUI.CruxAddr = "localhost"
	}

	return settings
}

// Save the settings
func saveSettings(settings Settings) {
	if settings.SettingsWrite {
		userconfdir, _ := os.UserConfigDir()
		settingspath := fmt.Sprintf("%s/%s/%s", userconfdir, SettingsFileDir, SettingsFileName)

		// If settingspath is default, we create the directory for it
		if settings.SettingsFilePath == settingspath {
			if _, err := os.Stat(filepath.Dir(settingspath)); errors.Is(err, os.ErrNotExist) {
				err = os.Mkdir(filepath.Dir(settingspath), DirPerms)
				if err != nil {
					log.Fatalf("%v", err)
				}
			} else if err != nil {
				log.Fatalf("%v", err)
			}
		}

		filedata, err := yaml.Marshal(&settings.SettingsFile)
		if err != nil {
			log.Fatalf("%v", err)
		}

		err = os.WriteFile(settings.SettingsFilePath, filedata, FilePerms)
		if err != nil {
			log.Fatalf("%v", err)
		}
	}
}

// There are options which are not filled out by default, we need to initialize values
func LoadDefaultsOnEmpty(settings Settings) Settings {
	// Set Docker Image location
	settings.Crux.Image = "ghcr.io/dyrector-io/dyrectorio/web/crux"
	settings.CruxUI.Image = "ghcr.io/dyrector-io/dyrectorio/web/crux-ui"
	settings.Kratos.Image = "ghcr.io/dyrector-io/dyrectorio/web/kratos"

	// Store state to settings
	if settings.CruxDisabled != settings.SettingsFile.CruxDisabled {
		settings.SettingsFile.CruxDisabled = settings.CruxDisabled
	}
	if settings.CruxUIDisabled != settings.SettingsFile.CruxUIDisabled {
		settings.SettingsFile.CruxUIDisabled = settings.CruxUIDisabled
	}

	settings.SettingsFile.Version = LoadStringVal(settings.SettingsFile.Version, "latest")
	settings.SettingsFile.Network = LoadStringVal(settings.SettingsFile.Network, "dyrectorio-stack")
	settings.SettingsFile.Prefix = LoadStringVal(settings.SettingsFile.Prefix, "dyrectorio-stack")
	settings.SettingsFile.TimeZone = LoadStringVal(settings.SettingsFile.TimeZone, "Europe/Budapest")

	settings.SettingsFile.CruxAgentGrpcPort = LoadIntVal(settings.SettingsFile.CruxAgentGrpcPort, DefaultCruxAgentGrpcPort)
	settings.SettingsFile.CruxGrpcPort = LoadIntVal(settings.SettingsFile.CruxGrpcPort, DefaultCruxGrpcPort)
	settings.SettingsFile.CruxUIPort = LoadIntVal(settings.SettingsFile.CruxUIPort, DefaultCruxUIPort)
	settings.SettingsFile.CruxSecret = LoadStringVal(settings.SettingsFile.CruxSecret, RandomChars(SecretLength))
	settings.SettingsFile.CruxPostgresPort = LoadIntVal(settings.SettingsFile.CruxPostgresPort, DefaultCruxPostgresPort)
	settings.SettingsFile.CruxPostgresDB = LoadStringVal(settings.SettingsFile.CruxPostgresDB, "crux")
	settings.SettingsFile.CruxPostgresUser = LoadStringVal(settings.SettingsFile.CruxPostgresUser, "crux")
	settings.SettingsFile.CruxPostgresPassword = LoadStringVal(settings.SettingsFile.CruxPostgresPassword, RandomChars(SecretLength))
	settings.SettingsFile.KratosAdminPort = LoadIntVal(settings.SettingsFile.KratosAdminPort, DefaultKratosAdminPort)
	settings.SettingsFile.KratosPublicPort = LoadIntVal(settings.SettingsFile.KratosPublicPort, DefaultKratosPublicPort)
	settings.SettingsFile.KratosPostgresPort = LoadIntVal(settings.SettingsFile.KratosPostgresPort, DefaultKratosPostgresPort)
	settings.SettingsFile.KratosPostgresDB = LoadStringVal(settings.SettingsFile.KratosPostgresDB, "kratos")
	settings.SettingsFile.KratosPostgresUser = LoadStringVal(settings.SettingsFile.KratosPostgresUser, "kratos")
	settings.SettingsFile.KratosPostgresPassword = LoadStringVal(settings.SettingsFile.KratosPostgresPassword, RandomChars(SecretLength))
	settings.SettingsFile.KratosSecret = LoadStringVal(settings.SettingsFile.KratosSecret, RandomChars(SecretLength))
	settings.SettingsFile.MailSlurperPort = LoadIntVal(settings.SettingsFile.MailSlurperPort, DefaultMailSlurperPort)

	// settings.NetworkGatewayIP = GetNetworkID()

	return settings
}

func LoadStringVal(value, def string) string {
	if value == "" {
		return def
	}
	return value
}

func LoadIntVal(value, def uint) uint {
	if value == 0 {
		return def
	}
	return value
}

func RandomChars(bufflength uint) string {
	buffer := make([]byte, bufflength*bufferMultiplier)
	_, err := rand.Read(buffer)
	if err != nil {
		log.Fatalf("error: %v", err)
	}
	secureString := make([]byte, base64.StdEncoding.EncodedLen(len(buffer)))
	base64.StdEncoding.Encode(secureString, buffer)

	result := strings.ReplaceAll(
		strings.ReplaceAll(
			strings.ReplaceAll(
				string(secureString),
				"+", ""),
			"/", ""),
		"=", "")

	return result[0:bufflength]
}
