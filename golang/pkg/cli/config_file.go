package cli

import (
	"bufio"
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"net"
	"os"
	"path"
	"strconv"
	"strings"

	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	imageHelper "github.com/dyrector-io/dyrectorio/golang/pkg/helper/image"

	containerRuntime "github.com/dyrector-io/dyrectorio/golang/internal/runtime/container"

	"github.com/docker/docker/client"
	"github.com/ilyakaznacheev/cleanenv"
	"github.com/rs/zerolog/log"
	"gopkg.in/yaml.v3"
)

// State itself exists per-execution, settingsFile is persisted
// freedesktop spec folders used by default, $XDG_CONFIG_HOME
type State struct {
	SettingsFile       SettingsFile
	InternalHostDomain string
	*Containers
}

type ArgsFlags struct {
	SettingsWrite       bool
	SettingsExists      bool
	SettingsFilePath    string
	Command             string
	ImageTag            string
	Prefix              string
	SpecialImageTag     string
	DisableForcepull    bool
	DisablePodmanChecks bool
	CruxDisabled        bool
	CruxUIDisabled      bool
	FullyContainerized  bool
	Network             string
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
	LocalAgent bool
}

// Settings file will be read/written as this struct
type SettingsFile struct {
	// version as in image tag like "latest" or "stable"
	Version string `yaml:"version" env-default:"latest"`
	Network string `yaml:"network-name" env-default:"dyo-stable"`
	Prefix  string `yaml:"prefix" env-default:"dyo-stable"`
	Options
}

type Options struct {
	TimeZone                       string `yaml:"timezone" env-default:"Europe/Budapest"`
	CruxAgentGrpcPort              uint   `yaml:"crux-agentgrpc-port" env-default:"5000"`
	CruxGrpcPort                   uint   `yaml:"crux-grpc-port" env-default:"5001"`
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

// Assemble the location of the settings file
func SettingsFileLocation(settingsPath string) string {
	if settingsPath == "" {
		userConfDir, err := os.UserConfigDir()
		if err != nil {
			log.Fatal().Err(err).Stack().Msg("Couldn't determine the user's configuration dir")
		}
		settingsPath = fmt.Sprintf("%s/%s/%s", userConfDir, SettingsFileDir, SettingsFileName)
	}

	return settingsPath
}

// Reading and parsing the settings.yaml
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

	ctx := context.Background()

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Stack().Err(err).Send()
	}

	err = containerRuntime.VersionCheck(ctx, cli)
	if err != nil {
		switch {
		case errors.Is(err, containerRuntime.ErrServerIsOutdated):
			log.Warn().Stack().Err(err).Msg("Server is outdated, please consider updating")
		case errors.Is(err, containerRuntime.ErrServerVersionIsNotSupported):
			log.Fatal().Stack().Err(err).Msg("Server is outdated")
		default:
			log.Fatal().Stack().Err(err).Send()
		}
	}

	// Fill out data if empty
	state := LoadDefaultsOnEmpty(initialState, args)
	state.InternalHostDomain, err = containerRuntime.GetInternalHostDomain(context.Background(), cli)
	if err != nil {
		log.Fatal().Stack().Err(err).Send()
	}

	EnsureNetworkExists(state, args)

	if args.Network != "" {
		state.SettingsFile.Network = args.Network
	}

	if args.ImageTag != "" {
		state.SettingsFile.Version = args.ImageTag
	}

	// Set disabled stuff
	state = DisabledServiceSettings(state)

	// Settings Validation steps

	if args.SettingsWrite {
		SaveSettings(state, args)
	}

	return state
}

func DisabledServiceSettings(state *State) *State {
	if state.Containers.CruxUI.Disabled {
		state.CruxUI.CruxAddr = localhost
	} else {
		state.CruxUI.CruxAddr = fmt.Sprintf("%s_crux", state.SettingsFile.Prefix)
	}

	return state
}

func PrintInfo(state *State, args *ArgsFlags) {
	log.Warn().Msg("🦩🦩🦩 Use the CLI tool only for NON-PRODUCTION purpose. 🦩🦩🦩")

	if state.Containers.Crux.Disabled {
		log.Info().Msg("Do not forget to add your environmental variables to your .env files or export them!")
		log.Info().Msgf("DATABASE_URL=postgresql://%s:%s@localhost:%d/%s?schema=public",
			state.SettingsFile.CruxPostgresUser,
			state.SettingsFile.CruxPostgresPassword,
			state.SettingsFile.CruxPostgresPort,
			state.SettingsFile.CruxPostgresDB)
	}

	log.Info().Msgf("Stack is ready. The UI should be available at http://localhost:%d location.",
		state.SettingsFile.Options.TraefikWebPort)
	log.Info().Msgf("The e-mail service should be available at http://localhost:%d location.",
		state.SettingsFile.Options.MailSlurperWebPort)
	log.Info().Msg("Happy deploying! 🎬")
}

func SettingsPath() string {
	userConfDir, err := os.UserConfigDir()
	if err != nil {
		log.Fatal().Err(err).Stack().Send()
	}

	return path.Join(userConfDir, SettingsFileDir, SettingsFileName)
}

// Save the settings
func SaveSettings(state *State, args *ArgsFlags) {
	settingsPath := SettingsPath()

	// If settingsPath is default, we create the directory for it
	if args.SettingsFilePath == settingsPath {
		if _, err := os.Stat(path.Dir(settingsPath)); errors.Is(err, os.ErrNotExist) {
			err = os.MkdirAll(path.Dir(settingsPath), DirPerms)
			if err != nil {
				log.Fatal().Err(err).Stack().Send()
			}
			printWelcomeMessage(args.SettingsFilePath)
		} else if err != nil {
			log.Fatal().Err(err).Stack().Send()
		}
	}

	filedata, err := yaml.Marshal(state.SettingsFile)
	if err != nil {
		log.Fatal().Err(err).Stack().Send()
	}

	err = os.WriteFile(args.SettingsFilePath, filedata, FilePerms)
	if err != nil {
		log.Fatal().Err(err).Stack().Send()
	}

	args.SettingsWrite = false
}

func printWelcomeMessage(settingsPath string) {
	log.Info().Msgf("The config file is located at %s, where you can turn this message off.", settingsPath)
	log.Info().Msgf("If you have any questions head to our Discord - https://discord.gg/pZWbd4fxga ! We're happy to help!")
	log.Info().Msgf("You can learn more about the project at https://docs.dyrector.io, if you found this project useful please " +
		"give us a star - https://github.com/dyrector-io/dyrectorio")
}

// There are options which are not filled out by default, we need to initialize values
func LoadDefaultsOnEmpty(state *State, args *ArgsFlags) *State {
	// Set Docker Image location
	state.Crux.Image = "ghcr.io/dyrector-io/dyrectorio/web/crux"
	state.CruxUI.Image = "ghcr.io/dyrector-io/dyrectorio/web/crux-ui"
	state.Kratos.Image = "ghcr.io/dyrector-io/dyrectorio/web/kratos"

	// Pushing down prefix
	if args.Prefix != "" {
		state.SettingsFile.Prefix = args.Prefix
	}

	// Load defaults
	state.SettingsFile.CruxSecret = util.Fallback(state.SettingsFile.CruxSecret, RandomChars(SecretLength))
	state.SettingsFile.CruxPostgresPassword = util.Fallback(state.SettingsFile.CruxPostgresPassword, RandomChars(SecretLength))
	state.SettingsFile.KratosPostgresPassword = util.Fallback(state.SettingsFile.KratosPostgresPassword, RandomChars(SecretLength))
	state.SettingsFile.KratosSecret = util.Fallback(state.SettingsFile.KratosSecret, RandomChars(SecretLength))

	// Generate names
	state.Containers.Traefik.Name = fmt.Sprintf("%s_traefik", state.SettingsFile.Prefix)
	state.Containers.Crux.Name = fmt.Sprintf("%s_crux", state.SettingsFile.Prefix)
	state.Containers.CruxMigrate.Name = fmt.Sprintf("%s_crux-migrate", state.SettingsFile.Prefix)
	state.Containers.CruxUI.Name = fmt.Sprintf("%s_crux-ui", state.SettingsFile.Prefix)
	state.Containers.Kratos.Name = fmt.Sprintf("%s_kratos", state.SettingsFile.Prefix)
	state.Containers.KratosMigrate.Name = fmt.Sprintf("%s_kratos-migrate", state.SettingsFile.Prefix)
	state.Containers.CruxPostgres.Name = fmt.Sprintf("%s_crux-postgres", state.SettingsFile.Prefix)
	state.Containers.KratosPostgres.Name = fmt.Sprintf("%s_kratos-postgres", state.SettingsFile.Prefix)
	state.Containers.MailSlurper.Name = fmt.Sprintf("%s_mailslurper", state.SettingsFile.Prefix)

	return state
}

// This function will check if an image with the given custom tag is existing
// on the local system, otherwise will fall back and pull
// This func is for testing locally built docker images
func TryImage(dockerImage, specialTag string) string {
	fullDockerImage, err := imageHelper.ExpandImageName(dockerImage)
	if err != nil {
		log.Err(err).Stack().Send()
	}

	imageName := fullDockerImage
	if specialTag != "" {
		imageName, err = imageHelper.ExpandImageNameWithTag(fullDockerImage, specialTag)
		if err != nil {
			log.Err(err).Stack().Send()
		}
	}

	exists, err := imageHelper.Exists(context.TODO(), nil, imageName)
	if err != nil {
		log.Err(err).Stack().Send()
	}

	if exists {
		log.Debug().Str("image", imageName).Msg("found, won't pull")
		return imageName
	}

	log.Debug().Str("image", dockerImage).Msg("not found, will pull")
	return fullDockerImage
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

func CheckAndUpdatePorts(state *State, args *ArgsFlags) {
	portMap := map[string]uint{}
	if !state.Containers.Crux.Disabled {
		portMap[CruxAgentGrpcPort] = getAvailablePort(portMap, state.SettingsFile.Options.CruxAgentGrpcPort,
			CruxAgentGrpcPort, &args.SettingsWrite)
		state.SettingsFile.Options.CruxAgentGrpcPort = portMap[CruxAgentGrpcPort]
		portMap[CruxGrpcPort] = getAvailablePort(portMap, state.SettingsFile.Options.CruxGrpcPort,
			CruxGrpcPort, &args.SettingsWrite)
		state.SettingsFile.Options.CruxGrpcPort = portMap[CruxGrpcPort]
	}
	if !state.Containers.CruxUI.Disabled {
		portMap[CruxUIPort] = getAvailablePort(portMap, state.SettingsFile.Options.CruxUIPort,
			CruxUIPort, &args.SettingsWrite)
		state.SettingsFile.Options.CruxUIPort = portMap[CruxUIPort]
	}

	portMap[CruxPostgresPort] = getAvailablePort(portMap, state.SettingsFile.Options.CruxPostgresPort,
		CruxPostgresPort, &args.SettingsWrite)
	state.SettingsFile.Options.CruxPostgresPort = portMap[CruxPostgresPort]
	portMap[KratosAdminPort] = getAvailablePort(portMap, state.SettingsFile.Options.KratosAdminPort,
		KratosAdminPort, &args.SettingsWrite)
	state.SettingsFile.Options.KratosAdminPort = portMap[KratosAdminPort]
	portMap[KratosPublicPort] = getAvailablePort(portMap, state.SettingsFile.Options.KratosPublicPort,
		KratosPublicPort, &args.SettingsWrite)
	state.SettingsFile.Options.KratosPublicPort = portMap[KratosPublicPort]
	portMap[KratosPostgresPort] = getAvailablePort(portMap, state.SettingsFile.Options.KratosPostgresPort,
		KratosPostgresPort, &args.SettingsWrite)
	state.SettingsFile.Options.KratosPostgresPort = portMap[KratosPostgresPort]
	portMap[MailSlurperSMTPPort] = getAvailablePort(portMap, state.SettingsFile.Options.MailSlurperSMTPPort,
		MailSlurperSMTPPort, &args.SettingsWrite)
	state.SettingsFile.Options.MailSlurperSMTPPort = portMap[MailSlurperSMTPPort]
	portMap[MailSlurperWebPort] = getAvailablePort(portMap, state.SettingsFile.Options.MailSlurperWebPort,
		MailSlurperWebPort, &args.SettingsWrite)
	state.SettingsFile.Options.MailSlurperWebPort = portMap[MailSlurperWebPort]
	portMap[MailSlurperWebPort2] = getAvailablePort(portMap, state.SettingsFile.Options.MailSlurperWebPort2,
		MailSlurperWebPort2, &args.SettingsWrite)
	state.SettingsFile.Options.MailSlurperWebPort2 = portMap[MailSlurperWebPort2]
	portMap[TraefikWebPort] = getAvailablePort(portMap, state.SettingsFile.Options.TraefikWebPort,
		TraefikWebPort, &args.SettingsWrite)
	state.SettingsFile.Options.TraefikWebPort = portMap[TraefikWebPort]
	portMap[TraefikUIPort] = getAvailablePort(portMap, state.SettingsFile.Options.TraefikUIPort,
		TraefikUIPort, &args.SettingsWrite)
	state.SettingsFile.Options.TraefikUIPort = portMap[TraefikUIPort]
}

func getAvailablePort(portMap map[string]uint, portNum uint, portDesc string, changed *bool) uint {
	for {
		err := portIsAvailable(portMap, portNum)
		if err != nil {
			log.Error().Err(err).Str("value", portDesc).Send()
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
