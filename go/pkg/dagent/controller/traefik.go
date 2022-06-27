package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gitlab.com/dyrector_io/dyrector.io/go/internal/dogger"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent/config"
	model "gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent/model"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent/utils"
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
	deployRequest := model.TraefikDeployRequest{}
	dog := dogger.NewDeploymentLogger(nil, nil, c, &config.Cfg.CommonConfiguration)

	if err := c.BindJSON(&deployRequest); err != nil {
		dog.Write("error starting traefik: " + err.Error())
		c.JSON(http.StatusBadRequest, model.TraefikDeployResponse{Error: err.Error()})
		return
	}

	err := utils.ExecTraefik(c, deployRequest)

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
	dog := dogger.NewDeploymentLogger(nil, nil, c, &config.Cfg.CommonConfiguration)
	err := utils.DeleteContainer("traefik")

	if err != nil {
		c.JSON(http.StatusOK, gin.H{"error": err.Error()})
		dog.Write(err.Error())
		return
	}
	c.JSON(http.StatusOK, model.TraefikDeployResponse{})
}
