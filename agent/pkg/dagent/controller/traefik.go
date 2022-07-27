package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/dyrector-io/dyrectorio/agent/internal/dogger"
	model "github.com/dyrector-io/dyrectorio/agent/pkg/dagent/model"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/utils"
)

// DeployVersion godoc
// @Summary Deploy a traefik instance, fails if there is one already running
// @Description Deploy with a dagent compatible configuration
// @Tags deploy, traefik
// @Accept json
// @Produce json
// @Param req body model.TraefikDeployRequest true "Body"
// @Success 200 {object} model.TraefikDeployResponse
// @Router /deploy/traefik [post]
func DeployTraefik(c *gin.Context) {
	cfg := utils.GetConfigFromGin(c)

	deployRequest := model.TraefikDeployRequest{}
	dog := dogger.NewDeploymentLogger(nil, nil, c, &cfg.CommonConfiguration)

	if err := c.BindJSON(&deployRequest); err != nil {
		dog.Write("error starting traefik: " + err.Error())
		c.JSON(http.StatusBadRequest, model.TraefikDeployResponse{Error: err.Error()})
		return
	}

	err := utils.ExecTraefik(c, deployRequest, cfg)

	if err != nil {
		c.JSON(http.StatusOK, model.TraefikDeployResponse{Error: err.Error()})
		dog.Write(err.Error())
		return
	}

	c.JSON(http.StatusOK, model.TraefikDeployResponse{})
}

// DeployVersion godoc
// @Summary Stops/removes running traefik container
// @Description Delete container with name traefik
// @Tags deploy, traefik
// @Produce json
// @Success 200 {object} model.TraefikDeployResponse
// @Router /deploy/traefik [delete]
func DeleteTraefik(c *gin.Context) {
	cfg := utils.GetConfigFromGin(c)

	dog := dogger.NewDeploymentLogger(nil, nil, c, &cfg.CommonConfiguration)
	err := utils.DeleteContainer("traefik")

	if err != nil {
		c.JSON(http.StatusOK, gin.H{"error": err.Error()})
		dog.Write(err.Error())
		return
	}
	c.JSON(http.StatusOK, model.TraefikDeployResponse{})
}
