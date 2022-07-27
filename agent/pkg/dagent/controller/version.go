package controller

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/utils"
)

type VersionQuery struct {
	Instance string `uri:"instance" binding:"required"`
}

// GetVersion godoc
// @Summary Get deployed versions
// @Description Deployed versions are present in the filesystem as yml files per instance, this queries for an instance's versions
// @Tags monitoring
// @Produce json
// @Param instance path string true "Instance or prefix name"
// @Success 200 {object} []utils.ReleaseDoc
// @Router /versions/{instance} [get]
func GetVersion(c *gin.Context) {
	query := &VersionQuery{}

	if err := c.BindUri(&query); err != nil {
		log.Println("version request binding error: ", err.Error())
		return
	}

	config := utils.GetConfigFromGin(c)

	versions := utils.GetVersions(query.Instance, config)
	c.JSON(http.StatusOK, versions)
}
