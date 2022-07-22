package version

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

var (
	Version        = "dev"
	CommitHash     = "n/a"
	BuildTimestamp = "n/a"
)

func BuildVersion() string {
	return fmt.Sprintf("%s-%s (%s)", Version, CommitHash, BuildTimestamp)
}

func VersionForGin(c *gin.Context) {
	c.String(http.StatusOK, "%s", BuildVersion())
}
