package util

import (
	"log"
	"os"

	"github.com/ilyakaznacheev/cleanenv"
	craneConfig "gitlab.com/dyrector_io/dyrector.io/go/pkg/crane/config"
	dagentConfig "gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent/config"
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
