package version

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

var (
	Version        = "dev" //nolint:gochecknoglobals
	CommitHash     = "n/a" //nolint:gochecknoglobals
	BuildTimestamp = "n/a" //nolint:gochecknoglobals
)

func BuildVersion() string {
	return fmt.Sprintf("%s-%s (%s)", Version, CommitHash, BuildTimestamp)
}

// VersionForGin godoc
// @Summary Get version string of the agent container
// @Description  Version is formatted as "<agent-version>-<commit-hash> "(<build-date>)", also available on the /version path
// @Tags info
// @Accept */*
// @Produce application/text
// @Success 200 {string} string
// @Router /version [get]
func VersionForGin(c *gin.Context) {
	c.String(http.StatusOK, "%s", BuildVersion())
}
