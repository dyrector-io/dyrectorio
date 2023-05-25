package cli

import (
	"encoding/json"
	"io"
	"os"
	"path"

	imageHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/image"

	"github.com/docker/docker/pkg/jsonmessage"
	"github.com/rs/zerolog/log"

	tm "github.com/buger/goterm"
)

// PrintWelcomeMessage prints a welcome mesage before the command runs
func PrintWelcomeMessage(settingsPath string) {
	log.Info().Msgf("The config file is located at %s, where you can turn this message off.", settingsPath)
	log.Info().Msgf("If you have any questions head to our Discord - https://discord.gg/pZWbd4fxga ! We're happy to help!")
	log.Info().Msgf("You can learn more about the project at https://docs.dyrector.io, if you found this project useful please " +
		"give us a star - https://github.com/dyrector-io/dyrectorio")
}

// PrintInfo tells the user not to use in prod and prints postgres information if crux is disabled
func PrintInfo(state *State, args *ArgsFlags) {
	log.Warn().Msg("🦩🦩🦩 Use the CLI tool only for NON-PRODUCTION purposes. 🦩🦩🦩")

	if args.CruxDisabled {
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
		state.SettingsFile.Options.MailSlurperUIPort)
	log.Info().Msg("Happy deploying! 🎬")
}

// NotifyOnce makes sure user only gets some information only once
func NotifyOnce(name string, notifyFunc func()) {
	targetDir, err := os.UserCacheDir()
	if err != nil {
		log.Trace().Err(err).Msgf("cache folder is not available to store temporary info, using tmp directory")
		targetDir = os.TempDir()
	}

	notificationPath := path.Join(targetDir, CLIDirName, "."+name)
	if _, err := os.Stat(notificationPath); err != nil {
		err = os.WriteFile(notificationPath, []byte{}, os.ModePerm)
		if err != nil {
			log.Trace().Err(err).Msgf("cache folder is not available to store temporary info")
		}
	}
	notifyFunc()
}

type status struct {
	Current int64
	Total   int64
}

func DockerPullProgressDisplayer(header string, respIn io.ReadCloser) error {
	dec := json.NewDecoder(respIn)
	stat := map[string]*status{}

	var pulled, pulling, waiting int
	for i := 0; ; i++ {
		var jm jsonmessage.JSONMessage
		if err := dec.Decode(&jm); err != nil {
			if err == io.EOF {
				log.Info().Msgf("%s ✓ pull complete ", header)

				return nil
			}
		}

		phase := imageHelper.LpsFromString(jm.Status)
		if phase != imageHelper.LayerProgressStatusUnknown && stat[jm.ID] == nil {
			stat[jm.ID] = &status{}
		}
		switch {
		case phase == imageHelper.LayerProgressStatusMatching:
			log.Info().Msgf("%s ✓ up-to-date", header)
			return nil
		case phase == imageHelper.LayerProgressStatusStarting ||
			phase == imageHelper.LayerProgressStatusWaiting:
			stat[jm.ID].Total = jm.Progress.Total
			waiting++
		case phase == imageHelper.LayerProgressStatusDownloading:
			stat[jm.ID].Current = jm.Progress.Current
			pulling++
		case phase == imageHelper.LayerProgressStatusComplete || phase == imageHelper.LayerProgressStatusExists:
			pulled++
		}
		if phase != imageHelper.LayerProgressStatusUnknown {
			if len(stat) > 1 {
				log.Info().Msgf("%v %s layers: %d/%d", header, spinner(i), pulled, len(stat))
				tm.MoveCursorUp(1)
				tm.Flush()
			}
		}
	}
}

var spinChars = []string{"⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"}

func spinner(n int) string {
	return spinChars[n%len(spinChars)]
}
