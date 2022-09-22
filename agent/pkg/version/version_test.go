//go:build integration
// +build integration

package version_test

import (
	"regexp"
	"testing"

	"github.com/dyrector-io/dyrectorio/agent/pkg/version"
	"github.com/stretchr/testify/assert"
)

// Version text format "<agent-version>-<commit-hash> (<build-date>)" where <build-date> is an ISO 8601 UTC date string
const VersionFormatRegex = "^(\\w*)\\-(\\w*)\\ \\(\\d{4}-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d(\\.\\d+)?(([+-]\\d\\d:\\d\\d)|Z)?\\)$"

func TestDefaults(t *testing.T) {
	version.Version = "dev"
	version.CommitHash = "n/a"
	version.BuildTimestamp = "n/a"

	formatted := version.BuildVersion()

	match, err := regexp.MatchString(VersionFormatRegex, formatted)
	if err != nil {
		t.Error(err)
	}
	assert.False(t, match)
}

func TestCorrect(t *testing.T) {
	version.Version = "8730dea"
	version.CommitHash = "3129618"
	version.BuildTimestamp = "2022-07-28T12:39:15Z"

	formatted := version.BuildVersion()

	match, err := regexp.MatchString(VersionFormatRegex, formatted)
	if err != nil {
		t.Error(err)
	}
	assert.True(t, match)
}

func TestBuildTimestampSpace(t *testing.T) {
	version.Version = "8730dea"
	version.CommitHash = "3129618"
	version.BuildTimestamp = "2022-07-28T12:39:15Z "

	formatted := version.BuildVersion()

	match, err := regexp.MatchString(VersionFormatRegex, formatted)
	if err != nil {
		t.Error(err)
	}
	assert.False(t, match)
}

func TestInvalidVersion(t *testing.T) {
	version.Version = "-"
	version.CommitHash = "3129618"
	version.BuildTimestamp = "2022-07-28T12:39:15Z"

	formatted := version.BuildVersion()

	match, err := regexp.MatchString(VersionFormatRegex, formatted)
	if err != nil {
		t.Error(err)
	}
	assert.False(t, match)
}

func TestInvalidCommitHash(t *testing.T) {
	version.Version = "8730dea"
	version.CommitHash = "-"
	version.BuildTimestamp = "2022-07-28T12:39:15Z"

	formatted := version.BuildVersion()

	match, err := regexp.MatchString(VersionFormatRegex, formatted)
	if err != nil {
		t.Error(err)
	}
	assert.False(t, match)
}

func TestBuildTimestampFormat(t *testing.T) {
	version.Version = "8730dea"
	version.CommitHash = "3129618"
	version.BuildTimestamp = "2022.07.28 12:39:15"

	formatted := version.BuildVersion()

	match, err := regexp.MatchString(VersionFormatRegex, formatted)
	if err != nil {
		t.Error(err)
	}
	assert.False(t, match)
}
