package controller

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/dyrector-io/dyrectorio/agent/internal/dogger"
	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/k8s"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/model"
)

// DeployImage godoc
// @Summary Deploy an image from a Registry.
// @Description Deployment with all configuration.
// @Tags deploy
// @Accept */*
// @Produce json
// @Param req body v1.DeployImageRequest true "Deploy Image Request"
// @Success 200 {object} v1.DeployImageResponse
// @Router /deploy [post]
func DeployImage(c *gin.Context) {
	deployImageRequest := &v1.DeployImageRequest{}

	t1 := time.Now()

	dog := dogger.NewDeploymentLogger(nil, nil, c.Request.Context(), &config.Cfg.CommonConfiguration)
	if err := c.ShouldBindJSON(deployImageRequest); err != nil {
		handleDeployBindingError(c, deployImageRequest, dog, err)
		return
	}
	dog.SetRequestID(deployImageRequest.RequestID)

	defer func(t1 time.Time) {
		duration := fmt.Sprintf("Deployment took: %.2f seconds", time.Since(t1).Seconds())
		log.Println(duration)
		dog.Write(duration)
	}(t1)

	dog.Write(deployImageRequest.Strings(&config.Cfg.CommonConfiguration)...)
	dog.Write(deployImageRequest.InstanceConfig.Strings()...)
	dog.Write(deployImageRequest.ContainerConfig.Strings(&config.Cfg.CommonConfiguration)...)
	runtimeConfigStr := string(deployImageRequest.RuntimeConfig)

	deployFacade := k8s.NewDeployFacade(
		&k8s.DeployFacadeParams{
			Ctx: c.Request.Context(),
			Image: util.ImageURI{
				Host: util.GetRegistryURL(deployImageRequest.Registry, deployImageRequest.RegistryAuth),
				Name: deployImageRequest.ImageName,
				Tag:  deployImageRequest.Tag,
			},
			InstanceConfig:  deployImageRequest.InstanceConfig,
			ContainerConfig: deployImageRequest.ContainerConfig,
			RuntimeConfig:   &runtimeConfigStr,
			Issuer:          deployImageRequest.Issuer,
		})
	if err := deployFacade.CheckPreConditions(); err != nil {
		handleDeploymentError(c, dog, deployImageRequest, err)
		return
	}

	if err := deployFacade.PreDeploy(); err != nil {
		handleDeploymentError(c, dog, deployImageRequest, err)
		return
	}

	if err := deployFacade.Deploy(); err != nil {
		handleDeploymentError(c, dog, deployImageRequest, err)
		return
	}

	if err := deployFacade.PostDeploy(); err != nil {
		handleDeploymentError(c, dog, deployImageRequest, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}

// todo: print line of json where is an err
func handleDeployBindingError(c *gin.Context, deployImageRequest *v1.DeployImageRequest, dog *dogger.DeploymentLogger, err error) {
	msg := ""

	if c.Request.Body != nil {
		body, readerr := io.ReadAll(c.Request.Body)

		if readerr != nil {
			log.Println("Error reading request body", err.Error())
			c.JSON(http.StatusBadRequest, model.NewErrorResponse(model.ValidationError, msg, "Invalid deploy request"))
			return
		}

		if deployImageRequest != nil {
			switch t := err.(type) {
			case *json.SyntaxError:
				jsn := string(body[0:t.Offset])
				jsn += "<--(Invalid Character)"
				msg = fmt.Sprintf("Invalid character at offset %v\n %v", t.Offset, jsn)
			case *json.UnmarshalTypeError:
				jsn := string(body[0:t.Offset])
				jsn += "<--(Invalid Type)"
				msg = fmt.Sprintf("Invalid value at offset %v\n %v", t.Offset, jsn)
			default:
				msg = err.Error()
			}
		}
	} else {
		msg = "Request body is empty."
	}

	dog.Write(fmt.Sprintf("Invalid deployment request: %v", msg))
	c.JSON(http.StatusBadRequest, model.NewErrorResponse(model.ValidationError, msg, "Invalid deploy request"))
}

func handleDeploymentError(c *gin.Context, dog *dogger.DeploymentLogger, deployment *v1.DeployImageRequest, err error) {
	dog.Write(err.Error())
	c.JSON(http.StatusBadRequest, v1.DeployImageResponse{
		Started:   false,
		Logs:      dog.GetLogs(),
		ImageName: &deployment.ImageName,
		Tag:       deployment.Tag,
		RequestID: &deployment.RequestID,
		Error:     err.Error(),
	})
}

// DeployImage godoc
// @Summary Deploy an Image Batch
// @Description Deployment with all configuration, if one of the deployment fail, the response still OK
// @Tags deploy, batch
// @Accept */*
// @Produce json
// @Param req body v1.BatchDeployImageRequest true  "Batch deployment"
// @Success 200 {object} v1.BatchDeployImageResponse
func BatchDeployImage(c *gin.Context) {
	batchDeployImageRequest := v1.BatchDeployImageRequest{}

	if err := c.ShouldBindJSON(&batchDeployImageRequest); err != nil {
		log.Println("could not bind the request", err.Error())
		// TECHDEBT: Using dyrectorio defined Error{} response
		c.AbortWithStatusJSON(http.StatusBadRequest, err.Error())
		return
	}

	// TODO Offset specific error message is missing right now
	batchDeployImageResponse := v1.BatchDeployImageResponse{}

	for i := range batchDeployImageRequest {
		runtimeConfigStr := string(batchDeployImageRequest[i].RuntimeConfig)

		dog := dogger.NewDeploymentLogger(nil, nil, c.Request.Context(), &config.Cfg.CommonConfiguration)
		dog.SetRequestID(batchDeployImageRequest[i].RequestID)
		dog.Write(batchDeployImageRequest[i].Strings(&config.Cfg.CommonConfiguration)...)

		deployFacade := k8s.NewDeployFacade(
			&k8s.DeployFacadeParams{
				Ctx: c.Request.Context(),
				Image: util.ImageURI{
					Host: util.GetRegistryURL(batchDeployImageRequest[i].Registry, batchDeployImageRequest[i].RegistryAuth),
					Name: batchDeployImageRequest[i].ImageName,
					Tag:  batchDeployImageRequest[i].Tag,
				},
				InstanceConfig:  batchDeployImageRequest[i].InstanceConfig,
				ContainerConfig: batchDeployImageRequest[i].ContainerConfig,
				RuntimeConfig:   &runtimeConfigStr,
			})
		if err := deployFacade.CheckPreConditions(); err != nil {
			log.Println("Error in pre-conditions: " + err.Error())
			dog.Write(err.Error())
			batchDeployImageResponse = append(batchDeployImageResponse, v1.DeployImageResponse{
				Started: false,
				Error:   err.Error(),
				Logs:    dog.GetLogs(),
			})
			c.JSON(http.StatusBadRequest, batchDeployImageResponse)
			return
		}

		if err := deployFacade.PreDeploy(); err != nil {
			log.Println("Error in pre-deploy: " + err.Error())
			dog.Write(err.Error())
			batchDeployImageResponse = append(batchDeployImageResponse, v1.DeployImageResponse{
				Started: false,
				Error:   err.Error(),
				Logs:    dog.GetLogs(),
			})
			c.JSON(http.StatusBadRequest, batchDeployImageResponse)
			return
		}

		if err := deployFacade.Deploy(); err != nil {
			log.Println("Error in deploy: " + err.Error())
			dog.Write(err.Error())
			batchDeployImageResponse = append(batchDeployImageResponse, v1.DeployImageResponse{
				Started: false,
				Error:   err.Error(),
				Logs:    dog.GetLogs(),
			})
			c.JSON(http.StatusBadRequest, batchDeployImageResponse)
			return
		}

		batchDeployImageResponse = append(batchDeployImageResponse, v1.DeployImageResponse{
			Started: true,
			Error:   "",
			Logs:    dog.GetLogs(),
		})
	}

	c.JSON(http.StatusOK, batchDeployImageResponse)
}

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
	deployVersionRequest := v1.DeployVersionRequest{}

	if err := c.ShouldBindJSON(&deployVersionRequest); err != nil {
		log.Println("could not bind the request", err.Error())
		// TECHDEBT: Using dyrectorio defined Error{} response
		c.AbortWithStatusJSON(http.StatusBadRequest, err.Error())
		return
	}

	// TODO Offset specific error message is missing right now
	deployVersionResponse := v1.DeployVersionResponse{}

	for i := range deployVersionRequest.DeployImages {
		runtimeConfigStr := string(deployVersionRequest.DeployImages[i].RuntimeConfig)

		dog := dogger.NewDeploymentLogger(
			&deployVersionRequest.DeployImages[i].RequestID,
			nil,
			c.Request.Context(),
			&config.Cfg.CommonConfiguration)
		dog.Write(deployVersionRequest.DeployImages[i].Strings(&config.Cfg.CommonConfiguration)...)

		versionEnv := "ReleaseVersion|" + deployVersionRequest.Version
		deployVersionRequest.DeployImages[i].ContainerConfig.Environment =
			append(deployVersionRequest.DeployImages[i].ContainerConfig.Environment, versionEnv)

		deployFacade := k8s.NewDeployFacade(
			&k8s.DeployFacadeParams{
				Ctx: c.Request.Context(),
				Image: util.ImageURI{
					Host: util.GetRegistryURL(deployVersionRequest.DeployImages[i].Registry, deployVersionRequest.DeployImages[i].RegistryAuth),
					Name: deployVersionRequest.DeployImages[i].ImageName,
					Tag:  deployVersionRequest.DeployImages[i].Tag,
				},
				InstanceConfig:  deployVersionRequest.DeployImages[i].InstanceConfig,
				ContainerConfig: deployVersionRequest.DeployImages[i].ContainerConfig,
				RuntimeConfig:   &runtimeConfigStr,
			})

		// todo(nandi): review bad requests, their presence is not justified, request might be correct `filozofiai kerdes`
		if err := deployFacade.CheckPreConditions(); err != nil {
			log.Println("Error in pre-conditions: " + err.Error())
			dog.Write(err.Error())
			deployVersionResponse = append(deployVersionResponse, v1.DeployImageResponse{
				Started: false,
				Error:   err.Error(),
				Logs:    dog.GetLogs(),
			})
			c.JSON(http.StatusBadRequest, deployVersionResponse)
			return
		}

		if err := deployFacade.PreDeploy(); err != nil {
			log.Println("Error in pre-deploy: " + err.Error())
			dog.Write(err.Error())
			deployVersionResponse = append(deployVersionResponse, v1.DeployImageResponse{
				Started: false,
				Error:   err.Error(),
				Logs:    dog.GetLogs(),
			})
			c.JSON(http.StatusBadRequest, deployVersionResponse)
			return
		}

		if err := deployFacade.Deploy(); err != nil {
			log.Println("Error in deploy: " + err.Error())
			dog.Write(err.Error())
			deployVersionResponse = append(deployVersionResponse, v1.DeployImageResponse{
				Started: false,
				Error:   err.Error(),
				Logs:    dog.GetLogs(),
			})
			c.JSON(http.StatusBadRequest, deployVersionResponse)
			return
		}
		deployVersionResponse = append(deployVersionResponse, v1.DeployImageResponse{
			Started: true,
			Error:   "",
			Logs:    dog.GetLogs(),
		})
	}

	c.JSON(http.StatusOK, deployVersionResponse)
}
