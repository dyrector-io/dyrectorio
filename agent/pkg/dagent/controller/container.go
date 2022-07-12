package controller

import (
	"log"
	"net/http"
	"strconv"
	"strings"

	_ "github.com/docker/docker/api/types"
	"github.com/gin-gonic/gin"

	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/config"
	model "github.com/dyrector-io/dyrectorio/agent/pkg/dagent/model"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/utils"
)

// GetContainers godoc
// @Summary Get list of running containers.
// @Description All the running containers, like a 'docker ps -a'
// @Tags runtime
// @Accept */*
// @Produce json
// @Success 200 {object} []types.Container
// @Router /containers [get]
func GetContainers(c *gin.Context) {
	containers, err := utils.ListContainers()

	if err != nil {
		log.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"data": containers,
		})
	}
}

// GetContainerStatus godoc
// @Summary Get running containers by name
// @Description Get running container by name with status and state, old url: /Status/GetStatus
// @Tags runtime
// @Accept */*
// @Produce json
// @Param containerName path string true "containerName"
// @Param containerPreName path string true "containerPreName"
// @Success 200 {object} model.ContainerStatusResponse
// @Router /containers/{containerPreName}/{containerName}/status [get]
func GetContainerStatus(c *gin.Context) {
	query := v1.DeploymentQuery{}

	if err := c.ShouldBindUri(&query); err != nil {
		log.Printf("GetContainerStatus bind error %s : %s", c.Request.RequestURI, err.Error())
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	containerName := util.JoinV("-", query.ContainerPreName, query.ContainerName)
	containers := utils.GetContainer(containerName)

	if len(containers) > 0 {
		imageName := strings.Split(containers[0].Image, ":")

		var imageTag string

		if len(imageName) > 0 {
			imageTag = imageName[1]
		} else {
			imageTag = "latest"
		}
		// image format: `minio/minio:RELEASE.2021-02-14T04-01-33Z`
		// other example: `nginx`
		// default means index.docker.io/library/nginx for official docker hub images
		// for others it is index.docker.io/user/imagename:tag
		// !! with k8s its better to always use FQDN

		resp := model.ContainerStatusResponse{Repository: imageName[0], Tag: imageTag, State: containers[0].State, Status: containers[0].Status}

		log.Println(resp)

		c.JSON(http.StatusOK, resp)
	} else {
		c.JSON(http.StatusNotFound, model.ErrorResponse{
			Errors: []model.Error{
				{
					Error:       model.NotFound,
					Value:       containerName,
					Description: "The {" + containerName + "} name not belongs to any container.",
				},
			},
		})
	}
}

// GetContainerLogs godoc
// @Summary Get the logs of the container by name
// @Description Get the logs of an existing container by name
// @Tags runtime
// @Accept */*
// @Produce json
// @Param containerName path string true "containerName"
// @Param containerPreName path string true "containerPreName"
// @Param skip query int false "paginationSkip" default(0)
// @Param take query int false "paginationTake" default(100)
// @Success 200 {array} []string
// @Failure 400 {object} model.ErrorResponse
// @Failure 404 {object} model.ErrorResponse
// @Router /containers/{containerPreName}/{containerName}/logs [get]
func GetContainerLogs(c *gin.Context) {
	query := &v1.DeploymentQuery{}

	if err := c.ShouldBindUri(&query); err != nil {
		log.Printf("GetContainerLogs bind error %s : %s", c.Request.RequestURI, err.Error())
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	containerName := util.JoinV("-", query.ContainerPreName, query.ContainerName)
	containers := utils.GetContainer(containerName)

	if len(containers) < 1 {
		c.JSON(http.StatusNotFound, model.ErrorResponse{
			Errors: []model.Error{
				{
					Error:       model.NotFound,
					Value:       "name",
					Description: "The container with the given name doesn't exist",
				},
			},
		})
		return
	}

	skip, err := strconv.ParseUint(c.Query("skip"), 10, 64) //nolint:gomnd
	if err != nil {
		skip = config.Cfg.LogDefaultSkip
	}

	take, err := strconv.ParseUint(c.Query("take"), 10, 64) //nolint:gomnd
	if err != nil {
		take = config.Cfg.LogDefaultTake
	}

	logs := utils.GetContainerLogs(containerName, uint(skip), uint(take))

	c.PureJSON(http.StatusOK, logs)
}

// InspectContainer godoc
// @Summary Inspect the container by name
// @Description Inspect an existing container by name
// @Tags runtime
// @Accept */*
// @Produce json
// @Param containerName path string true "containerName"
// @Param containerPreName path string true "containerPreName"
// @Success 200 {object} types.ContainerJSON
// @Failure 400 {object} model.ErrorResponse
// @Failure 404 {object} model.ErrorResponse
// @Router /containers/{containerPreName}/{containerName}/inspect [get]
func InspectContainer(c *gin.Context) {
	query := &v1.DeploymentQuery{}

	if err := c.ShouldBindUri(&query); err != nil {
		log.Printf("InspectContainer bind error %s : %s", c.Request.RequestURI, err.Error())
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	containerName := util.JoinV("-", query.ContainerPreName, query.ContainerName)
	containers := utils.GetContainer(containerName)

	if len(containers) < 1 {
		c.JSON(http.StatusNotFound, model.ErrorResponse{
			Errors: []model.Error{
				{
					Error:       model.NotFound,
					Value:       "name",
					Description: "The container with the given name doesn't exist",
				},
			},
		})
	}

	inspectation := utils.InspectContainer(containerName)

	c.JSON(http.StatusOK, inspectation)
}

// DeleteContainer godoc
// @Summary Delete running container by name
// @Description Delete running container by name with status and state
// @Tags runtime
// @Accept */*
// @Produce json
// @Param containerName query string true "containerName"
// @Param containerPreName query string true "containerPreName"
// @Success 200
// @Router /containers/{containerPreName}/{containerName} [delete]
func DeleteContainer(c *gin.Context) {
	query := &v1.DeploymentQuery{}

	if err := c.ShouldBindUri(&query); err != nil {
		log.Printf("DeleteContainer bind error %s : %s", c.Request.RequestURI, err.Error())
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	containerName := util.JoinV("-", query.ContainerPreName, query.ContainerName)
	containers := utils.GetContainer(containerName)

	if len(containers) == 1 {
		if err := utils.DeleteContainer(containerName); err != nil {
			log.Println(err.Error())

			c.JSON(http.StatusConflict, model.ErrorResponse{
				Errors: []model.Error{
					{
						Error:       model.NotFound,
						Value:       "containerName",
						Description: "Container error.",
					},
				},
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{"deleted": true})
	} else if len(containers) > 1 {
		c.JSON(http.StatusConflict, model.ErrorResponse{
			Errors: []model.Error{
				{
					Error:       model.MultipleContainerFound,
					Value:       "containerName",
					Description: "The given name belongs to multiple container.",
				},
			},
		})
	} else {
		c.JSON(http.StatusNotFound, model.ErrorResponse{
			Errors: []model.Error{
				{
					Error:       model.NotFound,
					Value:       "containerName",
					Description: "The given name not belongs to any container.",
				},
			},
		})
	}
}
