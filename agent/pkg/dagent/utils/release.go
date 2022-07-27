package utils

import (
	"errors"
	"fmt"
	"log"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"gopkg.in/yaml.v3"

	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/config"
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
func DraftRelease(instance string, versionData v1.VersionData, deployResponse v1.DeployVersionResponse, config *config.Configuration) {
	releaseDirPath := path.Join(config.InternalMountPath, instance, "@release")
	if err := os.MkdirAll(releaseDirPath, os.ModePerm); err != nil {
		panic(err)
	}
	release := ReleaseDoc{
		ReleaseNotes: versionData.ReleaseNotes,
		Version:      versionData.Version,
		Date:         time.Now(),
		Containers:   mapDeployResponseToRelease(deployResponse),
	}

	content, err := yaml.Marshal(&release)

	if err != nil {
		log.Println(fmt.Sprintln("Version drafting error ", err))
	}

	filePath := path.Join(releaseDirPath, fmt.Sprintf("%v.yml", versionData.Version))

	if _, err = os.Stat(filePath); err == nil {
		// path exists -> making a backup
		log.Println("Already existing release file, backing it up")
		path.Join(releaseDirPath, fmt.Sprintf("%v.yml", versionData.Version))

		if errr := os.Rename(
			filePath,
			path.Join(releaseDirPath, fmt.Sprintf("%v-backup-%v.yml", versionData.Version, time.Now().Unix()))); errr != nil {
			log.Println("Existing release file backup failed, overwriting existing release file", errr.Error())
		}
	} else if errors.Is(err, os.ErrNotExist) {
		// nothing on path -> creating release file
		// no-op
	} else {
		// file may or may not exist - Schrodinger -> something is really-really not gud
		log.Panic(err.Error())
	}

	err = os.WriteFile(filePath, content, os.ModePerm)
	if err != nil {
		log.Println(fmt.Sprintln("Writing release file error ", err))
	}
}

func GetVersions(instance string, config *config.Configuration) []ReleaseDoc {
	releaseDirPath := path.Join(config.InternalMountPath, instance, "@release")
	if err := os.MkdirAll(filepath.Clean(releaseDirPath), os.ModePerm); err != nil {
		panic(err)
	}

	releases := []ReleaseDoc{}

	files, err := os.ReadDir(releaseDirPath)
	if err != nil {
		if os.IsNotExist(err) {
			return releases
		} else {
			log.Fatal(err)
		}
	}

	for i := range files {
		if !strings.HasSuffix(files[i].Name(), ".yml") || files[i].IsDir() {
			continue
		} else {
			content, err := os.ReadFile(filepath.Clean(path.Join(releaseDirPath, files[i].Name())))
			if err != nil {
				log.Printf("Release read error for instance: %v, file: %v\n%v", instance, files[i].Name(), err)
				continue
			}

			release := ReleaseDoc{}

			err = yaml.Unmarshal(content, &release)
			if err != nil {
				log.Println(err.Error())
			}
			releases = append(releases, release)
		}
	}

	return releases
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
