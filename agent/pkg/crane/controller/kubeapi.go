package controller

import (
	"log"
	"net/http"

	_ "github.com/docker/docker/api/types"
	"github.com/gin-gonic/gin"

	apiv1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"

	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/k8s"
	_ "github.com/dyrector-io/dyrectorio/agent/pkg/crane/model"

	_ "k8s.io/api/apps/v1"
	_ "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
)

// GetNamespaces godoc
// @Summary Get list of available namespaces.
// @Tags k8s
// @Accept */*
// @Produce json
// @Success 200 {object} []k8s.Namespace
// @Router /namespaces [get]
func GetNamespaces(c *gin.Context) {
	namespaces, err := k8s.GetNamespaces()

	if err != nil {
		log.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	} else {
		c.JSON(http.StatusOK, namespaces)
	}
}

// GetDeployments godoc
// @Summary Get list of available deployments.
// @Tags k8s
// @Accept */*
// @Produce json
// @Success 200 {object} v1.DeploymentList
// @Router /deployments [get]
func GetDeployments(c *gin.Context) {
	// todo(nandi): this is not smort to-be-done
	deployments, err := k8s.GetDeployments("default")

	if err != nil {
		log.Println(err)
		c.JSON(http.StatusNotImplemented, gin.H{"error": err.Error()})
	} else {
		c.JSON(http.StatusNotImplemented, deployments)
	}
}

// GetContainerStatus godoc
// @Summary Get running containers by name
// @Description Get running container by name with status and state
// @Tags runtime
// @Accept */*
// @Produce json
// @Param containerName path string true "containerName"
// @Param containerPreName path string true "containerPreName"
// @Success 200 {object} v1.ContainerStatusResponse
// @Router /containers/{containerPreName}/{containerName}/status [get]
func GetDeploymentStatus(c *gin.Context) {
	query := &apiv1.DeploymentQuery{}

	if err := c.BindUri(&query); err != nil {
		log.Println("GetDeploymentStatus bind error: ", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := k8s.DeploymentStatus(query.ContainerPreName, query.ContainerName)

	if err != nil {
		log.Println("Status error: ", err.Error())
		c.JSON(http.StatusNotFound, gin.H{})
		return
	}
	c.JSON(http.StatusOK, resp)
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
func GetDeploymentLogs(c *gin.Context) {
	query := &apiv1.DeploymentQuery{}

	if err := c.BindUri(&query); err != nil {
		log.Println("GetDeploymentLogs bind error: ", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.PureJSON(http.StatusOK, gin.H{})
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
func DescribeDeployment(c *gin.Context) {
	query := &apiv1.DeploymentQuery{}

	if err := c.BindUri(&query); err != nil {
		log.Println("DescribeDeployment bind error: ", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}

// DeleteContainer godoc
// @Summary Delete running container by name
// @Description Delete running container by name with status and state
// @Tags runtime
// @Accept */*
// @Produce json
// @Param containerName path string true "containerName"
// @Param containerPreName path string true "containerPreName"
// @Success 200
// @Router /containers/{containerPreName}/{containerName} [delete]
func DeleteDeployment(c *gin.Context) {
	query := &apiv1.DeleteDeploymentQuery{}

	if err := c.BindUri(&query); err != nil {
		log.Println("GetDeploymentStatus bind error: ", err.Error())
		return
	}

	del := k8s.NewDeleteFacade(c, query.ContainerPreName, query.ContainerName)

	// delete deployment is necessary while others are optional
	// deployments contain containers
	err := del.DeleteDeployment()
	if errors.IsNotFound(err) {
		c.JSON(http.StatusNotFound, apiv1.DeleteDeploymentResponse{Error: err.Error()})
		return
	} else if err != nil {
		c.JSON(http.StatusBadRequest, apiv1.DeleteDeploymentResponse{Error: err.Error()})
		return
	}

	// optional deletes, each deploy request overwrites/redeploys them anyway
	err = del.DeleteServices()
	if !errors.IsNotFound(err) && err != nil {
		log.Println("Delete service error: " + err.Error())
	}

	err = del.DeleteConfigMaps()
	if !errors.IsNotFound(err) && err != nil {
		log.Println("Delete configmaps error: " + err.Error())
	}

	err = del.DeleteIngresses()
	if !errors.IsNotFound(err) && err != nil {
		log.Println("Delete ingress error: " + err.Error())
	}

	c.JSON(http.StatusOK, apiv1.DeleteDeploymentResponse{})
}
