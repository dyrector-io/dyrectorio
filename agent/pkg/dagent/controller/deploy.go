package controller

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/dyrector-io/dyrectorio/agent/internal/dogger"
	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/config"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/utils"
)

// DeployVersion godoc
// @Summary Deploy a Complete Product with Version Info
// @Description Deployment with all configuration and version, if one of the deployment fail, the response still OK
// @Tags deploy, batch
// @Accept json
// @Produce json
// @Param req body v1.DeployVersionRequest true "Batch deploy with version data"
// @Success 200 {object} v1.DeployVersionResponse
// @Router /deploy/version [post]
func DeployVersion(c *gin.Context) {
	batchDeployRequest := v1.DeployVersionRequest{}
	batchDeployResponse := v1.DeployVersionResponse{}

	if err := c.ShouldBindJSON(&batchDeployRequest); err != nil {
		log.Println("could not bind the request", err.Error())
		// TECHDEBT: Using dyrectorio defined Error{} response
		c.AbortWithStatusJSON(http.StatusBadRequest, err.Error())
		return
	}

	errored := false
	// Iterate throw the given DeployImageRequests
	for i := range batchDeployRequest.DeployImages {
		dog := dogger.NewDeploymentLogger(nil, nil, c, &config.Cfg.CommonConfiguration)
		dog.SetRequestID(batchDeployRequest.DeployImages[i].RequestID)

		var versionData *v1.VersionData
		if !errored && i == len(batchDeployRequest.DeployImages) {
			versionData = &v1.VersionData{Version: batchDeployRequest.Version, ReleaseNotes: batchDeployRequest.ReleaseNotes}
		}

		if err := executeDeployImageRequest(c, dog, &batchDeployRequest.DeployImages[i], versionData); err != nil {
			dog.Write(err.Error())

			batchDeployResponse = append(batchDeployResponse, v1.DeployImageResponse{
				Started:   false,
				Error:     err.Error(),
				RequestID: &batchDeployRequest.DeployImages[i].RequestID,
				ImageName: &batchDeployRequest.DeployImages[i].ImageName,
				Tag:       batchDeployRequest.DeployImages[i].Tag,
				Logs:      dog.GetLogs(),
			})
			errored = true
		} else {
			batchDeployResponse = append(batchDeployResponse, v1.DeployImageResponse{
				Started:   true,
				Error:     "",
				RequestID: &batchDeployRequest.DeployImages[i].RequestID,
				ImageName: &batchDeployRequest.DeployImages[i].ImageName,
				Tag:       batchDeployRequest.DeployImages[i].Tag,
				Logs:      dog.GetLogs(),
			})
		}
	}

	c.JSON(http.StatusOK, batchDeployResponse)
}

// BatchDeployImage godoc
// @Summary Deploy an Image Batch
// @Description Deployment with all configuration, if one of the deployment fail, the response still OK
// @Tags deploy, batch
// @Accept */*
// @Produce json
// @Param req body v1.BatchDeployImageRequest true  "Batch deployment"
// @Success 200 {object} v1.BatchDeployImageResponse
// @Router /deploy/batch [post]
func BatchDeployImage(c *gin.Context) {
	batchDeployImageRequest := v1.BatchDeployImageRequest{}
	batchDeployImageResponse := v1.BatchDeployImageResponse{}

	if err := c.ShouldBindJSON(&batchDeployImageRequest); err != nil {
		log.Println("could not bind the request", err.Error())
		// TECHDEBT: Using dyrectorio defined Error{} response
		c.AbortWithStatusJSON(http.StatusBadRequest, err.Error())
		return
	}

	// Iterate throw the given DeployImageRequests
	for i := range batchDeployImageRequest {
		dog := dogger.NewDeploymentLogger(nil, nil, c, &config.Cfg.CommonConfiguration)
		dog.SetRequestID(batchDeployImageRequest[i].RequestID)
		if err := executeDeployImageRequest(c, dog, &batchDeployImageRequest[i], nil); err != nil {
			dog.Write(err.Error())

			batchDeployImageResponse = append(batchDeployImageResponse, v1.DeployImageResponse{
				Started:   false,
				Error:     err.Error(),
				RequestID: &batchDeployImageRequest[i].RequestID,
				ImageName: &batchDeployImageRequest[i].ImageName,
				Logs:      dog.GetLogs(),
			})
		} else {
			batchDeployImageResponse = append(batchDeployImageResponse, v1.DeployImageResponse{
				Started:   true,
				Error:     "",
				RequestID: &batchDeployImageRequest[i].RequestID,
				ImageName: &batchDeployImageRequest[i].ImageName,
				Logs:      dog.GetLogs(),
			})
		}
	}

	c.JSON(http.StatusOK, batchDeployImageResponse)
}

// DeployImage godoc
// @Summary Deploy an image from a Registry.
// @Description Deployment with all configuration.
// @Tags deploy
// @Accept */*
// @Produce json
// @Param req body v1.DeployImageRequest true "Deploy a container"
// @Success 200 {object} v1.DeployImageResponse
// @Router /deploy [post]
func DeployImage(c *gin.Context) {
	deployImageRequest := v1.DeployImageRequest{}

	dog := dogger.NewDeploymentLogger(nil, nil, c, &config.Cfg.CommonConfiguration)
	if err := c.ShouldBindJSON(&deployImageRequest); err != nil {
		log.Println("could not bind the request", err.Error())
		if deployImageRequest.RequestID != "" {
			dog.Write("Invalid deployment request: " + err.Error())
		}
		// TECHDEBT: Using dyrectorio defined Error{} response
		c.AbortWithStatusJSON(http.StatusBadRequest, err.Error())
		return
	}
	dog.SetRequestID(deployImageRequest.RequestID)

	if err := executeDeployImageRequest(c, dog, &deployImageRequest, nil); err != nil {
		dog.Write(err.Error())
		// TECHDEBT: Using dyrectorio defined Error{} response
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error: ": err.Error()})
		return
	} else {
		c.JSON(http.StatusOK, gin.H{"started": true})
	}
}

func executeDeployImageRequest(
	ctx context.Context,
	dog *dogger.DeploymentLogger,
	deployImageRequest *v1.DeployImageRequest, versionData *v1.VersionData) error {
	t1 := time.Now()
	defer func(t1 time.Time) {
		dog.Write(fmt.Sprintf("Deployment took: %.2f seconds", time.Since(t1).Seconds()))
	}(t1)

	v1.SetDeploymentDefaults(deployImageRequest, &config.Cfg.CommonConfiguration)
	dog.Write(fmt.Sprintf("Restart policy: %v \n", string(deployImageRequest.ContainerConfig.RestartPolicy)))

	if err := utils.DeployImage(ctx, dog, deployImageRequest, versionData); err != nil {
		dog.Write("Deployment failed " + err.Error())
		return err
	} else {
		dog.Write("Deployment succeeded.")
	}

	return nil
}
