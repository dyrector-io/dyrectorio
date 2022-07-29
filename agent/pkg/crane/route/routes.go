package route

import (
	"net/http"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"github.com/dyrector-io/dyrectorio/agent/internal/version"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/controller"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/docs"

	"github.com/gin-gonic/gin"
)

// SetupRouterV1 contains all types of routes
// it is mixed with original / new API calls
// todo: V2 http api
func SetupRouterV1(r *gin.Engine) *gin.Engine {
	support := r.Group("api")
	support.GET("/containers", controller.GetDeployments)
	support.GET("/Status/GetStatus", controller.GetDeploymentStatus)
	support.POST("/Distribution/DeployImage", controller.DeployImage)

	// DeployRequest -> facade -> configmaps + services + deployments + ingressobjects
	// deployments -> facade ->

	api := r.Group("v1")
	api.GET("/deployments", controller.GetDeployments)
	api.GET("/namespaces", controller.GetNamespaces)

	// based-off of dagents interface, cries for a refactor
	// two different domains to be synced into one API
	api.GET("/containers/:preName/:name/status", controller.GetDeploymentStatus)
	api.GET("/containers/:preName/:name/logs", controller.GetDeploymentLogs)
	api.GET("/containers/:preName/:name/inspect", controller.DeleteDeployment)
	api.GET("/containers", controller.GetDeployments)
	api.DELETE("/containers/:preName/:name", controller.DeleteDeployment)

	api.POST("/deploy", controller.DeployImage)
	api.POST("/deploy/batch", controller.BatchDeployImage)
	api.POST("/deploy/version", controller.DeployVersion)

	r.GET("/version", version.VersionForGin)
	api.GET("version", version.VersionForGin)
	api.GET("/swagger", swaggerRedirect)
	r.GET("swagger", swaggerRedirect)

	docs.SwaggerInfoCrane.BasePath = "/v1"
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	return r
}

func swaggerRedirect(c *gin.Context) {
	c.Redirect(http.StatusPermanentRedirect, "/swagger/index.html")
}

// SetupUpdate is for application image update weebhooks
func SetupUpdate(r *gin.Engine) *gin.Engine {
	r.POST("update", controller.UpdateRunningCrane)
	return r
}
