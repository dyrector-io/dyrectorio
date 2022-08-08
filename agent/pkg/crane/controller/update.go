package controller

import (
	"log"
	"net/http"

	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"
	"github.com/gin-gonic/gin"
)

type UpdateWebhook struct {
	Token *string `json:"token" binding:"required"`
}

// UpdateRunningcrane godoc
// @Summary Updates running agent
// @Description Incoming webhook triggers a one-shot check for updates in the configured remote registry
// @Tags monitoring
// @Accept */*
// @Produce json
// @Success 200
// @Router /update [post]
func UpdateRunningCrane(c *gin.Context) {
	var webhook UpdateWebhook

	if err := c.ShouldBind(&webhook); err != nil {
		log.Println("Could not bind the request: ", err.Error())
		c.AbortWithStatusJSON(http.StatusBadRequest, v1.ErrorResponse{Errors: []v1.Error{{
			Error:       v1.UpdateError,
			Value:       err.Error(),
			Description: "Error when trying to update via webhook.",
		}}})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
