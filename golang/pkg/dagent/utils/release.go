package utils

import (
	"errors"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/rs/zerolog/log"
	"gopkg.in/yaml.v3"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
)

type ReleaseDoc struct {
	Version      string
	ReleaseNotes string
	Date         time.Time
	Containers   []ReleaseContainer
}

type ReleaseContainer struct {
	Image      string
	Tag        string
	Successful bool
}

// DraftRelease writes release information to disk
// Into the instance folder @release directory, file with a release name
// yml extension the file containing release data
func DraftRelease(instance string, versionData v1.VersionData, deployResponse v1.DeployVersionResponse, cfg *config.Configuration) {
	releaseDirPath := path.Join(cfg.InternalMountPath, instance, "@release")
	if err := os.MkdirAll(releaseDirPath, os.ModePerm); err != nil {
		log.Error().Err(err).Str("path", releaseDirPath).Msg("Failed to create release folder")
		return
	}
	release := ReleaseDoc{
		ReleaseNotes: versionData.ReleaseNotes,
		Version:      versionData.Version,
		Date:         time.Now(),
		Containers:   mapDeployResponseToRelease(deployResponse),
	}

	content, err := yaml.Marshal(&release)
	if err != nil {
		log.Error().Err(err).Msg("Version drafting failed")
		return
	}

	filePath := path.Join(releaseDirPath, fmt.Sprintf("%v.yml", versionData.Version))

	if _, err = os.Stat(filePath); err == nil {
		// path exists -> making a backup
		log.Info().Msg("Already existing release file, backing it up")

		backupFilePath := path.Join(releaseDirPath, fmt.Sprintf("%v-backup-%v.yml", versionData.Version, time.Now().Unix()))

		if errr := os.Rename(
			filePath,
			backupFilePath); errr != nil {
			log.Error().
				Stack().
				Err(errr).
				Str("path", filePath).
				Str("newPath", backupFilePath).
				Msg("Existing release file backup failed, overwriting existing release file")
		}
	} else if !errors.Is(err, os.ErrNotExist) {
		// nothing on path -> creating release file
		// file may or may not exist - Schrodinger -> something is really-really not gud
		log.Panic().Stack().Err(err).Send()
	}

	err = os.WriteFile(filePath, content, os.ModePerm)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Writing release file error")
	}
}

func GetVersions(instance string, cfg *config.Configuration) ([]ReleaseDoc, error) {
	releaseDirPath := path.Join(cfg.InternalMountPath, instance, "@release")
	if err := os.MkdirAll(filepath.Clean(releaseDirPath), os.ModePerm); err != nil {
		return nil, err
	}

	releases := []ReleaseDoc{}

	files, err := os.ReadDir(releaseDirPath)
	if err != nil {
		if os.IsNotExist(err) {
			return releases, nil
		}
		log.Fatal().Stack().Err(err).Send()
	}

	for i := range files {
		if !strings.HasSuffix(files[i].Name(), ".yml") || files[i].IsDir() {
			continue
		}
		content, err := os.ReadFile(filepath.Clean(path.Join(releaseDirPath, files[i].Name())))
		if err != nil {
			log.Error().Stack().Err(err).Str("instance", instance).Str("path", files[i].Name()).Msg("Release read error")
			continue
		}

		release := ReleaseDoc{}

		err = yaml.Unmarshal(content, &release)
		if err != nil {
			log.Error().Stack().Err(err).Send()
		}
		releases = append(releases, release)
	}

	return releases, nil
}

func mapDeployResponseToRelease(deployResponse v1.DeployVersionResponse) []ReleaseContainer {
	containers := []ReleaseContainer{}

	for i := range deployResponse {
		containers = append(containers, ReleaseContainer{
			Image:      *deployResponse[i].ImageName,
			Tag:        deployResponse[i].Tag,
			Successful: deployResponse[i].Started,
		})
	}

	return containers
}
