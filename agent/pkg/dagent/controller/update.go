package controller

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	model "github.com/dyrector-io/dyrectorio/agent/pkg/dagent/model"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/utils"
)

// UpdateRunningDAgent godoc
// @Summary Updates running agent
// @Description Incoming webhook triggers a one-shot check for updates in the configured remote registry
// @Tags monitoring
// @Accept */*
// @Param req body model.UpdateWebhook true "Webhook auth data"
// @Success 200
// @Router /update [post]
func UpdateRunningDAgent(c *gin.Context) {
	var webhook model.UpdateWebhook

	config := utils.GetConfigFromGin(c)

	if err := c.ShouldBind(&webhook); err != nil {
		log.Println("Could not bind the request: ", err.Error())
		c.AbortWithStatusJSON(http.StatusBadRequest, model.ErrorResponse{Errors: []model.Error{{
			Error:       model.UpdateError,
			Value:       err.Error(),
			Description: "Error when trying to update via webhook.",
		}}})
		return
	}

	if webhook.Token != nil && *webhook.Token == config.WebhookToken {
		if err := utils.ExecWatchtowerOneShot(config); err != nil {
			log.Println("Update error: " + err.Error())
			c.JSON(http.StatusInternalServerError,
				model.ErrorResponse{Errors: []model.Error{{
					Error:       model.UpdateError,
					Value:       err.Error(),
					Description: "Error when trying to updated via webhook.",
				},
				}})
			return
		}
	} else {
		c.JSON(http.StatusUnauthorized,
			model.ErrorResponse{Errors: []model.Error{{
				Error:       model.UpdateError,
				Value:       "Missing or invalid token",
				Description: "",
			},
			}},
		)
		return
	}
	c.JSON(http.StatusOK, gin.H{})
}
