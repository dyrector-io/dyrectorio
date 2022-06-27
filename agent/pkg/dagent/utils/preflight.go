package utils

import (
	"fmt"
	"log"

	"github.com/hashicorp/go-version"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent/config"
)

func PreflightChecks() {
	_, err := ListContainers()
	if err != nil {
		log.Fatal(err.Error())
	}

	versions, err := GetServerInformation()
	if err != nil {
		log.Fatal("Version error ", err.Error())
	}

	log.Println("Docker Server version: ", versions.ServerVersion)
	log.Println("Docker Client version: ", versions.ClientVersion)

	serVer, err := version.NewVersion(versions.ServerVersion)
	if err != nil {
		log.Println("Invalid version string from server ", err.Error())
	}
	constraints, _ := version.NewConstraint(fmt.Sprintf(">=%s", config.Cfg.MinDockerServerVersion))
	if err != nil {
		log.Println("Error with version constraint ", err.Error())
	}
	if !constraints.Check(serVer) {
		log.Printf("WARNING: server is behind the supported version %s < %s", serVer, config.Cfg.MinDockerServerVersion)
	}
}
