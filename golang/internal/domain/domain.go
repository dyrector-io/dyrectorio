package domain

import (
	"github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
)

func GetHostRule(hostPrefix, hostRoot, containerName, prefix string, cfg *config.CommonConfiguration) string {
	domain := []string{}
	rootDomain := ""

	if hostRoot != "" {
		rootDomain = hostRoot
	} else if cfg.RootDomain != "" {
		rootDomain = cfg.RootDomain
	}

	// generate the name.prefix.domain from prefix and container name
	// no root domain -> no host rule
	if hostPrefix == "" && hostRoot == "" && cfg.RootDomain != "" {
		domain = append(domain, containerName, prefix, cfg.RootDomain)
	} else if hostPrefix != "" && rootDomain != "" {
		domain = append(domain, hostPrefix, rootDomain)
	}

	if len(domain) == 0 && rootDomain != "" {
		domain = append(domain, rootDomain)
	}
	return util.JoinV(".", domain...)
}
