package version

import (
	"fmt"
)

var (
	// Version represents the version of the application
	Version = "0.11.4"
	// CommitHash is the hash of the commit used for the build
	CommitHash = "n/a"
	// BuildTimestamp represents the timestamp when the build was created
	BuildTimestamp = "n/a"
)

func BuildVersion() string {
	return fmt.Sprintf("%s-%s (%s)", Version, CommitHash, BuildTimestamp)
}
