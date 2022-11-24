package utils

import (
	"bufio"
	"os"
	"strings"

	"github.com/rs/zerolog/log"
)

const CGroupFile = "/proc/self/cgroup"

func ParseCGroupFile() (string, error) {
	cgroupFile, err := os.Open(CGroupFile)
	if err != nil {
		return "", err
	}

	defer func() {
		err := cgroupFile.Close()
		if err != nil {
			log.Error().Err(err).Stack().Msg("Failed to close CGroup file")
		}
	}()

	scanner := bufio.NewScanner(cgroupFile)
	if scanner.Scan() {
		group := scanner.Text()
		lastSlash := strings.LastIndex(group, "/")
		if lastSlash < 0 {
			return group, nil
		}
		return group[lastSlash+1:], nil
	}

	return "", scanner.Err()
}
