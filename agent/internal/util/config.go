package util

import (
	"log"
	"os"

	"github.com/ilyakaznacheev/cleanenv"

	craneConfig "github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"
	dagentConfig "github.com/dyrector-io/dyrectorio/agent/pkg/dagent/config"
)

func ReadConfig[T craneConfig.Configuration | dagentConfig.Configuration](cfg *T) {
	// cleanenv configuration reader
	err := cleanenv.ReadConfig(".env", cfg)

	if err != nil && !os.IsNotExist(err) {
		log.Panic(err)
	} else {
		err = cleanenv.ReadEnv(cfg)
		if err != nil {
			log.Panic("invalid configuration: ", err.Error())
		}
	}

	log.Println("Configuration loaded.")
}
