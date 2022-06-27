package controller

import "github.com/gin-gonic/gin"

type RegistryAuthRequest struct {
	Namespace string `json:"namespace" binding:"required"`
	Name      string `json:"name" binding:"required"`
	Server    string `json:"server" binding:"required"`
	User      string `json:"user" binding:"required"`
	Password  string `json:"password" binding:"required"`
}

// DeployImage godoc
// @Summary Deploy an image from a Registry.
// @Description Deployment with all configuration.
// @Tags deploy
// @Accept */*
// @Produce json
// @Param req body RegistryAuthRequest true "body data"
// @Success 200
// @Router /registry [post]
func AddRegistry(c *gin.Context) {

}
