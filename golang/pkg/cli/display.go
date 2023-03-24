package cli

import (
	"os"
	"path"

	"github.com/rs/zerolog/log"
)

func PrintWelcomeMessage(settingsPath string) {
	log.Info().Msgf("The config file is located at %s, where you can turn this message off.", settingsPath)
	log.Info().Msgf("If you have any questions head to our Discord - https://discord.gg/pZWbd4fxga ! We're happy to help!")
	log.Info().Msgf("You can learn more about the project at https://docs.dyrector.io, if you found this project useful please " +
		"give us a star - https://github.com/dyrector-io/dyrectorio")
}

func PrintInfo(state *State) {
	log.Warn().Msg("🦩🦩🦩 Use the CLI tool only for NON-PRODUCTION purposes. 🦩🦩🦩")

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

func NotifyOnce(name string, notifyFunc func()) {
	targetDir, err := os.UserCacheDir()
	if err != nil {
		log.Trace().Err(err).Msgf("cache folder is not available to store temporal info, using tmp directory")
		targetDir = os.TempDir()
	}
	notificationPath := path.Join(targetDir, CLIDirName, "."+name)
	if _, err := os.Stat(notificationPath); err != nil {
		err = os.WriteFile(notificationPath, []byte{}, os.ModePerm)
		if err != nil {
			log.Trace().Err(err).Msgf("cache folder is not available to store temporal info")
		}
	}
	notifyFunc()
}
