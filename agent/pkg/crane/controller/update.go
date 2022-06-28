package controller

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/model"
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
		c.AbortWithStatusJSON(http.StatusBadRequest, model.ErrorResponse{Errors: []model.Error{{
			Error:       model.UpdateError,
			Value:       err.Error(),
			Description: "Error when trying to update via webhook.",
		}}})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
