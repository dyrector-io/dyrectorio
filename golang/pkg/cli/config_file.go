package cli

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"path"
	"strings"

	"github.com/dyrector-io/dyrectorio/golang/internal/util"

	containerRuntime "github.com/dyrector-io/dyrectorio/golang/internal/runtime/container"

	"github.com/docker/docker/client"
	"github.com/ilyakaznacheev/cleanenv"
	"github.com/rs/zerolog/log"
	"gopkg.in/yaml.v3"
)

// State itself exists per-execution, settingsFile is persisted
// freedesktop spec folders used by default, $XDG_CONFIG_HOME
type State struct {
	Ctx                context.Context
	SettingsFile       SettingsFile
	InternalHostDomain string
	*Containers
}

// ArgsFlags are commandline arguments
type ArgsFlags struct {
	SettingsWrite         bool
	SettingsExists        bool
	SettingsFilePath      string
	Command               string
	ImageTag              string
	Prefix                string
	CruxDisabled          bool
	CruxUIDisabled        bool
	LocalAgent            bool
	PrioritizeLocalImages bool
	// pipeline mode
	FullyContainerized bool
	Network            string
	Silent             bool
}

// Containers contain container/service specific settings
type Containers struct {
	Crux           ContainerSettings
	CruxMigrate    ContainerSettings
	CruxUI         ContainerSettings
	Traefik        ContainerSettings
	Kratos         ContainerSettings
	KratosMigrate  ContainerSettings
	CruxPostgres   ContainerSettings
	KratosPostgres ContainerSettings
	MailSlurper    ContainerSettings
}

// ContainerSettings are container specific settings
type ContainerSettings struct {
	Image    string
	Name     string
	Disabled bool
	CruxAddr string
}

// SettingsFile will be read/written as this struct
type SettingsFile struct {
	// version as in image tag like "latest" or "stable"
	Version string `yaml:"version" env-default:"stable"`
	Network string `yaml:"network-name" env-default:"dyo-stable"`
	Prefix  string `yaml:"prefix" env-default:"dyo-stable"`
	Options
}

// Options are "globals" for the SettingsFile struct
type Options struct {
	TimeZone                       string `yaml:"timezone" env-default:"UTC"`
	CruxAgentGrpcPort              uint   `yaml:"crux-agentgrpc-port" env-default:"5000"`
	CruxHTTPPort                   uint   `yaml:"crux-http-port" env-default:"1848"`
	CruxUIPort                     uint   `yaml:"crux-ui-port" env-default:"3000"`
	CruxSecret                     string `yaml:"crux-secret"`
	CruxPostgresPort               uint   `yaml:"cruxPostgresPort" env-default:"5432"`
	CruxPostgresDB                 string `yaml:"cruxPostgresDB" env-default:"crux"`
	CruxPostgresUser               string `yaml:"cruxPostgresUser" env-default:"crux"`
	CruxPostgresPassword           string `yaml:"cruxPostgresPassword"`
	TraefikWebPort                 uint   `yaml:"traefikWebPort" env-default:"8000"`
	TraefikUIPort                  uint   `yaml:"traefikUIPort" env-default:"8080"`
	TraefikDockerSocket            string `yaml:"traefikDockerSocket" env-default:"/var/run/docker.sock"`
	TraefikIsDockerSocketNamedPipe bool   `yaml:"traefikIsDockerSocketNamedPipe" env-default:"false"`
	KratosAdminPort                uint   `yaml:"kratosAdminPort" env-default:"4434"`
	KratosPublicPort               uint   `yaml:"kratosPublicPort" env-default:"4433"`
	KratosPostgresPort             uint   `yaml:"kratosPostgresPort" env-default:"5433"`
	KratosPostgresDB               string `yaml:"kratosPostgresDB" env-default:"kratos"`
	KratosPostgresUser             string `yaml:"kratosPostgresUser" env-default:"kratos"`
	KratosPostgresPassword         string `yaml:"kratosPostgresPassword"`
	KratosSecret                   string `yaml:"kratosSecret"`
	MailSlurperSMTPPort            uint   `yaml:"mailSlurperSMTPPort" env-default:"1025"`
	MailSlurperUIPort              uint   `yaml:"mailSlurperUIPort" env-default:"4436"`
	MailSlurperAPIPort             uint   `yaml:"mailSlurperAPIPort" env-default:"4437"`
	MailFromName                   string `yaml:"mailFromName" env-default:"dyrector.io - Platform"`
	MailFromEmail                  string `yaml:"mailFromEmail" env-default:"noreply@example.com"`
}

const (
	// SettingsFileName is the filename we use for storing configuration
	SettingsFileName = "settings.yaml"
	// CLIDirName is the directory where we save the configuration file under the users configuration directory
	CLIDirName = "dyo-cli"
)

const (
	filePerms        = 0o600
	dirPerms         = 0o750
	secretLength     = 32
	bufferMultiplier = 2
	localhost        = "localhost"
)

// SettingsExists is a check if the settings file is exists
func SettingsExists(settingsPath string) bool {
	settingsFilePath := SettingsFileLocation(settingsPath)

	if _, err := os.Stat(settingsFilePath); err == nil {
		return true
	} else if errors.Is(err, os.ErrNotExist) {
		return false
	} else {
		log.Fatal().Err(err).Stack().Send()
		return false
	}
}

// SettingsFileLocation is assembling the location of the settings file
func SettingsFileLocation(settingsPath string) string {
	if settingsPath == "" {
		userConfDir, err := os.UserConfigDir()
		if err != nil {
			log.Fatal().Err(err).Stack().Msg("Couldn't determine the user's configuration dir")
		}

		settingsPath = path.Join(userConfDir, CLIDirName, SettingsFileName)
	}

	return settingsPath
}

// SettingsFileDefaults creating, reading and parsing the settings.yaml
func SettingsFileDefaults(initialState *State, args *ArgsFlags) *State {
	settingsFile := SettingsFile{}
	if args.SettingsExists {
		err := cleanenv.ReadConfig(args.SettingsFilePath, &settingsFile)
		if err != nil {
			log.Fatal().Err(err).Stack().Msg("Failed to load configuration")
		}
	} else {
		args.SettingsWrite = true
		err := cleanenv.ReadEnv(&settingsFile)
		if err != nil {
			log.Fatal().Err(err).Stack().Msg("Failed to load configuration")
		}
	}
	initialState.SettingsFile = settingsFile

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Stack().Err(err).Send()
	}

	_, err = containerRuntime.VersionCheck(initialState.Ctx, cli)
	if err != nil {
		switch {
		case errors.Is(err, containerRuntime.ErrServerIsOutdated):
			NotifyOnce("dockerversion", func() {
				log.Info().Stack().Err(err).Msg("There is a newer version of the container engine in use, please consider updating.")
			})
		case errors.Is(err, containerRuntime.ErrServerVersionIsNotSupported):
			log.Fatal().Stack().Err(err).Msg("The container engine in use is not supported, please consider updating.")
		default:
			log.Fatal().Stack().Err(err).Send()
		}
	}

	// Fill out data if empty
	state := LoadDefaultsOnEmpty(initialState, args)
	state.InternalHostDomain, err = containerRuntime.GetInternalHostDomain(initialState.Ctx, cli)
	if err != nil {
		log.Fatal().Stack().Err(err).Send()
	}

	EnsureNetworkExists(state)

	if args.Network != "" {
		state.SettingsFile.Network = args.Network
	}

	if args.ImageTag != "" {
		state.SettingsFile.Version = args.ImageTag
	}

	// Set disabled stuff
	state = DisabledServiceSettings(state, args)

	// Settings Validation steps

	if args.SettingsWrite {
		SaveSettings(state, args)
	}

	return state
}

// DisabledServiceSettings modifies the setting if the crux-ui is disabled
func DisabledServiceSettings(state *State, args *ArgsFlags) *State {
	if args.CruxUIDisabled {
		state.CruxUI.CruxAddr = localhost
	} else {
		state.CruxUI.CruxAddr = fmt.Sprintf("%s_crux", args.Prefix)
	}

	return state
}

// SettingsPath returns the full path to the settingsfile
func SettingsPath() string {
	userConfDir, err := os.UserConfigDir()
	if err != nil {
		log.Fatal().Err(err).Stack().Send()
	}

	return path.Join(userConfDir, CLIDirName, SettingsFileName)
}

// SaveSettings saves the settings
func SaveSettings(state *State, args *ArgsFlags) {
	settingsPath := SettingsPath()

	// If settingsPath is default, we create the directory for it
	if args.SettingsFilePath == settingsPath {
		if _, err := os.Stat(path.Dir(settingsPath)); errors.Is(err, os.ErrNotExist) {
			err = os.MkdirAll(path.Dir(settingsPath), dirPerms)
			if err != nil {
				log.Fatal().Err(err).Stack().Send()
			}
			if !args.Silent {
				NotifyOnce("welcome", func() {
					PrintWelcomeMessage(args.SettingsFilePath)
				})
			}
		} else if err != nil {
			log.Fatal().Err(err).Stack().Send()
		}
	}

	filedata, err := yaml.Marshal(state.SettingsFile)
	if err != nil {
		log.Fatal().Err(err).Stack().Send()
	}

	err = os.WriteFile(args.SettingsFilePath, filedata, filePerms)
	if err != nil {
		log.Fatal().Err(err).Stack().Send()
	}

	args.SettingsWrite = false
}

// LoadDefaultsOnEmpty There are options which are not filled out by default, we need to initialize values
func LoadDefaultsOnEmpty(state *State, args *ArgsFlags) *State {
	// Set Docker Image location
	state.Crux.Image = "ghcr.io/dyrector-io/dyrectorio/web/crux"
	state.CruxUI.Image = "ghcr.io/dyrector-io/dyrectorio/web/crux-ui"
	state.Kratos.Image = "ghcr.io/dyrector-io/dyrectorio/web/kratos"

	// Load defaults
	state.SettingsFile.CruxSecret = util.Fallback(state.SettingsFile.CruxSecret, RandomChars(secretLength))
	state.SettingsFile.CruxPostgresPassword = util.Fallback(state.SettingsFile.CruxPostgresPassword, RandomChars(secretLength))
	state.SettingsFile.KratosPostgresPassword = util.Fallback(state.SettingsFile.KratosPostgresPassword, RandomChars(secretLength))
	state.SettingsFile.KratosSecret = util.Fallback(state.SettingsFile.KratosSecret, RandomChars(secretLength))

	// Generate names
	state.Containers.Traefik.Name = fmt.Sprintf("%s_traefik", args.Prefix)
	state.Containers.Crux.Name = fmt.Sprintf("%s_crux", args.Prefix)
	state.Containers.CruxMigrate.Name = fmt.Sprintf("%s_crux-migrate", args.Prefix)
	state.Containers.CruxUI.Name = fmt.Sprintf("%s_crux-ui", args.Prefix)
	state.Containers.Kratos.Name = fmt.Sprintf("%s_kratos", args.Prefix)
	state.Containers.KratosMigrate.Name = fmt.Sprintf("%s_kratos-migrate", args.Prefix)
	state.Containers.CruxPostgres.Name = fmt.Sprintf("%s_crux-postgres", args.Prefix)
	state.Containers.KratosPostgres.Name = fmt.Sprintf("%s_kratos-postgres", args.Prefix)
	state.Containers.MailSlurper.Name = fmt.Sprintf("%s_mailslurper", args.Prefix)

	return state
}

// CheckSettings makes sure your state is correct
func CheckSettings(state *State, args *ArgsFlags) {
	if args.SettingsWrite {
		SaveSettings(state, args)
	}
}

func RandomChars(bufflength uint) string {
	buffer := make([]byte, bufflength*bufferMultiplier)
	_, err := rand.Read(buffer)
	if err != nil {
		log.Error().Err(err).Stack().Send()
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

	return result[0:secretLength]
}
