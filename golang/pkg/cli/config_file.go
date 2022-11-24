package cli

import (
	"bufio"
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"net"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/docker/docker/client"
	"github.com/ilyakaznacheev/cleanenv"
	"github.com/rs/zerolog/log"
	"gopkg.in/yaml.v3"
)

// Settings and state of the application
type Settings struct {
	SettingsFile       SettingsFile
	SettingsWrite      bool
	SettingsExists     bool
	SettingsFilePath   string
	Command            string
	InternalHostDomain string
	Containers
}

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

type ContainerSettings struct {
	Image      string
	Name       string
	Disabled   bool
	CruxAddr   string
	CruxUIPort uint
	LocalAgent bool
}

// Settings file will be read/written as this struct
type SettingsFile struct {
	// version as in image tag like "latest" or "stable"
	Version        string `yaml:"version" env-default:"latest"`
	CruxDisabled   bool   `yaml:"crux_disabled" env-default:"false"`
	CruxUIDisabled bool   `yaml:"crux-ui_disabled" env-default:"false"`
	Network        string `yaml:"network-name" env-default:"dyrectorio-stack"`
	Prefix         string `yaml:"prefix" env-default:"dyrectorio-stack"`
	Options
}

type Options struct {
	TimeZone                       string `yaml:"timezone" env-default:"Europe/Budapest"`
	CruxAgentGrpcPort              uint   `yaml:"crux-agentgrpc-port" env-default:"5000"`
	CruxGrpcPort                   uint   `yaml:"crux-grpc-port" env-default:"5001"`
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
	MailSlurperWebPort             uint   `yaml:"mailSlurperWebPort" env-default:"4436"`
	MailSlurperWebPort2            uint   `yaml:"mailSlurperWebPort2" env-default:"4437"`
}

const (
	SettingsFileName = "settings.yaml"
	SettingsFileDir  = "dyo-cli"
)

const (
	CruxAgentGrpcPort   = "CruxAgentGrpcPort"
	CruxGrpcPort        = "CruxGrpcPort"
	CruxUIPort          = "CruxUIPort"
	KratosAdminPort     = "KratosAdminPort"
	KratosPublicPort    = "KratosPublicPort"
	KratosPostgresPort  = "KratosPostgresPort"
	MailSlurperSMTPPort = "MailSlurperSMTPPort"
	MailSlurperWebPort  = "MailSlurperWebPort"
	MailSlurperWebPort2 = "MailSlurperWebPort2"
	CruxPostgresPort    = "CruxPostgresPort"
	TraefikWebPort      = "TraeficWebPort"
	TraefikUIPort       = "TraefikUIPort"
)

const (
	ParseBase        = 10
	ParseBitSize     = 32
	FilePerms        = 0o600
	DirPerms         = 0o750
	SecretLength     = 32
	BufferMultiplier = 2
	localhost        = "localhost"
)

// Check if the settings file is exists
func SettingsExists(settingspath string) bool {
	settingsfilepath := SettingsFileLocation(settingspath)

	if _, err := os.Stat(settingsfilepath); err == nil {
		return true
	} else if errors.Is(err, os.ErrNotExist) {
		return false
	} else {
		log.Fatal().Err(err).Stack().Send()
		return false
	}
}

// Assemble the location of the settings file
func SettingsFileLocation(settingspath string) string {
	if settingspath == "" {
		userConfDir, err := os.UserConfigDir()
		if err != nil {
			log.Fatal().Err(err).Stack().Msg("Couldn't determine the user's configuration dir")
		}
		settingspath = fmt.Sprintf("%s/%s/%s", userConfDir, SettingsFileDir, SettingsFileName)
	}

	return settingspath
}

// Reading and parsing the settings.yaml
func SettingsFileReadWrite(state *Settings) *Settings {
	if state.SettingsExists {
		err := cleanenv.ReadConfig(state.SettingsFilePath, &state.SettingsFile)
		if err != nil {
			log.Fatal().Err(err).Stack().Msg("failed to load configuration")
		}
	} else {
		state.SettingsWrite = true
		err := cleanenv.ReadEnv(&state.SettingsFile)
		if err != nil {
			log.Fatal().Err(err).Stack().Msg("failed to load configuration")
		}
	}

	internalHostDomain := CheckRequirements()

	// Fill out data if empty
	settings := LoadDefaultsOnEmpty(state)
	settings.InternalHostDomain = internalHostDomain

	EnsureNetworkExists(settings)

	// Move other values
	settings.Containers.CruxUI.CruxUIPort = settings.SettingsFile.CruxUIPort

	// Set disabled stuff
	settings = DisabledServiceSettings(settings)

	// Settings Validation steps

	SaveSettings(settings)

	return settings
}

// Check prerequisites
func CheckRequirements() string {
	// getenv
	envVarValue := os.Getenv("DOCKER_HOST")

	if envVarValue != "" {
		socketurl, err := url.ParseRequestURI(envVarValue)
		if err != nil {
			log.Fatal().Err(err).Stack().Send()
		}

		if socketurl.Host != "" {
			log.Fatal().Msg("DOCKER_HOST variable shouldn't have host")
		}

		if socketurl.Scheme != "unix" {
			log.Fatal().Msg("DOCKER_HOST variable should contain a valid unix socket")
		}
	} else {
		// We cannot assume unix:///var/run/docker.sock on Mac/Win platforms, we let Docker SDK does its magic :)
		log.Warn().Msg("DOCKER_HOST environmental variable is empty or not set.")
		log.Warn().Msg("Using default socket determined by Docker SDK.")
	}

	// Check socket
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Err(err).Stack().Msg("docker socket connection unsuccessful")
	}

	info, err := cli.Info(context.Background())
	if err != nil {
		log.Fatal().Err(err).Stack().Msg("cannot get info via docker socket")
	}

	switch info.InitBinary {
	case "":
		log.Info().Str("version", info.ServerVersion).Msg("Podman")
		PodmanInfo()
		return PodmanHost
	case "docker-init":
		log.Info().Str("version", info.ServerVersion).Msg("Docker")
		return DockerHost
	default:
		log.Fatal().Msg("unknown init binary")
		return ""
	}
}

func PodmanInfo() {
	cmd := exec.Command("podman", "info", "--format", "{{.Host.NetworkBackend}}")

	stderr, err := cmd.StderrPipe()
	if err != nil {
		log.Fatal().Err(err).Stack().Msg("podman check stderr pipe error")
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		log.Fatal().Err(err).Stack().Msg("podman check stdout pipe error")
	}

	err = cmd.Start()
	if err != nil {
		log.Fatal().Err(err).Stack().Msg("podman command execution error")
	}

	readstderr, err := io.ReadAll(stderr)
	if err != nil {
		log.Fatal().Err(err).Stack().Msg("podman command stderr reading error")
	}

	readstdout, err := io.ReadAll(stdout)
	if err != nil {
		log.Fatal().Err(err).Stack().Msg("podman command stdout reading error")
	}

	err = cmd.Wait()
	if err != nil {
		log.Fatal().Err(err).Stack().Msg("podman command execution error")
	}

	if len(readstderr) != 0 {
		log.Fatal().Str("errOut", string(readstderr)).Msg("podman command execution error")
	}

	if string(readstdout) != "netavark\n" {
		log.Fatal().Msg("podman network backend error: it should have the netavark network backend")
	}
}

func DisabledServiceSettings(settings *Settings) *Settings {
	if settings.Containers.CruxUI.Disabled {
		settings.CruxUI.CruxAddr = localhost
	} else {
		settings.CruxUI.CruxAddr = fmt.Sprintf("%s_crux", settings.SettingsFile.Prefix)
	}

	return settings
}

func PrintInfo(settings *Settings) {
	log.Warn().Msg("🦩🦩🦩 Use the CLI tool only for NON-PRODUCTION purpose. 🦩🦩🦩")

	if settings.Containers.Crux.Disabled {
		log.Info().Msg("Do not forget to add your environmental variables to your .env files or export them!")
		log.Info().Msgf("DATABASE_URL=postgresql://%s:%s@localhost:%d/%s?schema=public",
			settings.SettingsFile.CruxPostgresUser,
			settings.SettingsFile.CruxPostgresPassword,
			settings.SettingsFile.CruxPostgresPort,
			settings.SettingsFile.CruxPostgresDB)
	}

	log.Info().Msgf("Stack is ready. The UI should be available at http://localhost:%d location.",
		settings.SettingsFile.Options.TraefikWebPort)
	log.Info().Msgf("The e-mail service should be available at http://localhost:%d location.",
		settings.SettingsFile.Options.MailSlurperWebPort)
	log.Info().Msg("Happy deploying! 🎬")
}

// Save the settings
func SaveSettings(settings *Settings) {
	if settings.SettingsWrite {
		userConfDir, err := os.UserConfigDir()
		if err != nil {
			log.Fatal().Err(err).Stack().Send()
		}
		settingspath := fmt.Sprintf("%s/%s/%s", userConfDir, SettingsFileDir, SettingsFileName)

		// If settingspath is default, we create the directory for it
		if settings.SettingsFilePath == settingspath {
			if _, err = os.Stat(userConfDir); errors.Is(err, os.ErrNotExist) {
				err = os.Mkdir(userConfDir, DirPerms)
				if err != nil {
					log.Fatal().Err(err).Stack().Send()
				}
			} else if err != nil {
				log.Fatal().Err(err).Stack().Send()
			}
			if _, err = os.Stat(filepath.Dir(settingspath)); errors.Is(err, os.ErrNotExist) {
				err = os.Mkdir(filepath.Dir(settingspath), DirPerms)
				if err != nil {
					log.Fatal().Err(err).Stack().Send()
				}
			} else if err != nil {
				log.Fatal().Err(err).Stack().Send()
			}
		}

		filedata, err := yaml.Marshal(&settings.SettingsFile)
		if err != nil {
			log.Fatal().Err(err).Stack().Send()
		}

		err = os.WriteFile(settings.SettingsFilePath, filedata, FilePerms)
		if err != nil {
			log.Fatal().Err(err).Stack().Send()
		}

		settings.SettingsWrite = false
	}
}

// There are options which are not filled out by default, we need to initialize values
func LoadDefaultsOnEmpty(settings *Settings) *Settings {
	// Set Docker Image location
	settings.Crux.Image = "ghcr.io/dyrector-io/dyrectorio/web/crux"
	settings.CruxUI.Image = "ghcr.io/dyrector-io/dyrectorio/web/crux-ui"
	settings.Kratos.Image = "ghcr.io/dyrector-io/dyrectorio/web/kratos"

	// Store state to settings
	if settings.Containers.Crux.Disabled != settings.SettingsFile.CruxDisabled {
		settings.SettingsFile.CruxDisabled = settings.Containers.Crux.Disabled
	}
	if settings.Containers.CruxUI.Disabled != settings.SettingsFile.CruxUIDisabled {
		settings.SettingsFile.CruxUIDisabled = settings.Containers.CruxUI.Disabled
	}

	// Load defaults
	settings.SettingsFile.CruxSecret = LoadStringVal(settings.SettingsFile.CruxSecret, RandomChars(SecretLength))
	settings.SettingsFile.CruxPostgresPassword = LoadStringVal(settings.SettingsFile.CruxPostgresPassword, RandomChars(SecretLength))
	settings.SettingsFile.KratosPostgresPassword = LoadStringVal(settings.SettingsFile.KratosPostgresPassword, RandomChars(SecretLength))
	settings.SettingsFile.KratosSecret = LoadStringVal(settings.SettingsFile.KratosSecret, RandomChars(SecretLength))

	// Generate names
	settings.Containers.Traefik.Name = fmt.Sprintf("%s_traefik", settings.SettingsFile.Prefix)
	settings.Containers.Crux.Name = fmt.Sprintf("%s_crux", settings.SettingsFile.Prefix)
	settings.Containers.CruxMigrate.Name = fmt.Sprintf("%s_crux-migrate", settings.SettingsFile.Prefix)
	settings.Containers.CruxUI.Name = fmt.Sprintf("%s_crux-ui", settings.SettingsFile.Prefix)
	settings.Containers.Kratos.Name = fmt.Sprintf("%s_kratos", settings.SettingsFile.Prefix)
	settings.Containers.KratosMigrate.Name = fmt.Sprintf("%s_kratos-migrate", settings.SettingsFile.Prefix)
	settings.Containers.CruxPostgres.Name = fmt.Sprintf("%s_crux-postgres", settings.SettingsFile.Prefix)
	settings.Containers.KratosPostgres.Name = fmt.Sprintf("%s_kratos-postgres", settings.SettingsFile.Prefix)
	settings.Containers.MailSlurper.Name = fmt.Sprintf("%s_mailslurper", settings.SettingsFile.Prefix)

	return settings
}

func LoadStringVal(value, def string) string {
	if value == "" {
		return def
	}
	return value
}

func RandomChars(bufflength uint) string {
	buffer := make([]byte, bufflength*BufferMultiplier)
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

	return result[0:bufflength]
}

func CheckAndUpdatePorts(settings *Settings) *Settings {
	portMap := map[string]uint{}
	if !settings.Containers.Crux.Disabled {
		portMap[CruxAgentGrpcPort] = getAvailablePort(portMap, settings.SettingsFile.Options.CruxAgentGrpcPort,
			CruxAgentGrpcPort, &settings.SettingsWrite)
		settings.SettingsFile.Options.CruxAgentGrpcPort = portMap[CruxAgentGrpcPort]
		portMap[CruxGrpcPort] = getAvailablePort(portMap, settings.SettingsFile.Options.CruxGrpcPort,
			CruxGrpcPort, &settings.SettingsWrite)
		settings.SettingsFile.Options.CruxGrpcPort = portMap[CruxGrpcPort]
	}
	if !settings.Containers.CruxUI.Disabled {
		portMap[CruxUIPort] = getAvailablePort(portMap, settings.SettingsFile.Options.CruxUIPort,
			CruxUIPort, &settings.SettingsWrite)
		settings.SettingsFile.Options.CruxUIPort = portMap[CruxUIPort]
	}

	portMap[CruxPostgresPort] = getAvailablePort(portMap, settings.SettingsFile.Options.CruxPostgresPort,
		CruxPostgresPort, &settings.SettingsWrite)
	settings.SettingsFile.Options.CruxPostgresPort = portMap[CruxPostgresPort]
	portMap[KratosAdminPort] = getAvailablePort(portMap, settings.SettingsFile.Options.KratosAdminPort,
		KratosAdminPort, &settings.SettingsWrite)
	settings.SettingsFile.Options.KratosAdminPort = portMap[KratosAdminPort]
	portMap[KratosPublicPort] = getAvailablePort(portMap, settings.SettingsFile.Options.KratosPublicPort,
		KratosPublicPort, &settings.SettingsWrite)
	settings.SettingsFile.Options.KratosPublicPort = portMap[KratosPublicPort]
	portMap[KratosPostgresPort] = getAvailablePort(portMap, settings.SettingsFile.Options.KratosPostgresPort,
		KratosPostgresPort, &settings.SettingsWrite)
	settings.SettingsFile.Options.KratosPostgresPort = portMap[KratosPostgresPort]
	portMap[MailSlurperSMTPPort] = getAvailablePort(portMap, settings.SettingsFile.Options.MailSlurperSMTPPort,
		MailSlurperSMTPPort, &settings.SettingsWrite)
	settings.SettingsFile.Options.MailSlurperSMTPPort = portMap[MailSlurperSMTPPort]
	portMap[MailSlurperWebPort] = getAvailablePort(portMap, settings.SettingsFile.Options.MailSlurperWebPort,
		MailSlurperWebPort, &settings.SettingsWrite)
	settings.SettingsFile.Options.MailSlurperWebPort = portMap[MailSlurperWebPort]
	portMap[MailSlurperWebPort2] = getAvailablePort(portMap, settings.SettingsFile.Options.MailSlurperWebPort2,
		MailSlurperWebPort2, &settings.SettingsWrite)
	settings.SettingsFile.Options.MailSlurperWebPort2 = portMap[MailSlurperWebPort2]
	portMap[TraefikWebPort] = getAvailablePort(portMap, settings.SettingsFile.Options.TraefikWebPort,
		TraefikWebPort, &settings.SettingsWrite)
	settings.SettingsFile.Options.TraefikWebPort = portMap[TraefikWebPort]
	portMap[TraefikUIPort] = getAvailablePort(portMap, settings.SettingsFile.Options.TraefikUIPort,
		TraefikUIPort, &settings.SettingsWrite)
	settings.SettingsFile.Options.TraefikUIPort = portMap[TraefikUIPort]

	return settings
}

func getAvailablePort(portMap map[string]uint, portNum uint, portDesc string, changed *bool) uint {
	for {
		err := portIsAvailable(portMap, portNum)
		if err != nil {
			log.Error().Err(err).Str("Value", portDesc).Send()
			portNum = scanPort(portNum)
			log.Info().Msgf("New PORT %d binded successfully for %s.", portNum, portDesc)
			*changed = true
			continue
		}
		break
	}
	return portNum
}

func scanPort(portNum uint) uint {
	log.Info().Msg("Type another port: ")

	scanner := bufio.NewScanner(os.Stdin)
	for scanner.Scan() {
		newPort, err := strconv.ParseUint(scanner.Text(), ParseBase, ParseBitSize)
		if err != nil || (newPort > 0 && newPort <= 1023) || newPort == 0 {
			log.Error().Err(err).Send()
			log.Info().Msg("Type another port: ")
			continue
		}
		return uint(newPort)
	}
	return portNum
}

func portIsAvailable(portMap map[string]uint, portNum uint) error {
	err := portIsAvailableOnHost(portNum)
	if err == nil {
		err = externalPortIsDuplicated(portMap, portNum)
	}
	return err
}

func portIsAvailableOnHost(portNum uint) error {
	ln, err := net.Listen("tcp", fmt.Sprintf(":%d", portNum))
	if err != nil {
		return fmt.Errorf("can`t bind, %w", err)
	}

	err = ln.Close()
	if err != nil {
		return fmt.Errorf("can`t close, %w", err)
	}
	return nil
}

func externalPortIsDuplicated(portMap map[string]uint, candidatePort uint) error {
	for desc, port := range portMap {
		if port == candidatePort {
			return fmt.Errorf("port %d is used by %s", port, desc)
		}
	}
	return nil
}
