package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"github.com/dyrector-io/dyrectorio/agent/internal/version"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/controller"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/docs"
)

// all the routes, with 100 routes still be
func SetupRouter(r *gin.Engine) *gin.Engine {
	support := r.Group("api")
	support.GET("/containers", controller.GetContainers)
	support.GET("/Status/GetStatus", controller.GetContainerStatus)
	support.POST("/Distribution/DeployImage", controller.DeployImage)
	support.GET("/swagger", swaggerRedirect)

	v1 := r.Group("v1")
	v1.GET("/containers", controller.GetContainers)
	v1.GET("/containers/:preName/:name/logs", controller.GetContainerLogs)
	v1.GET("/containers/:preName/:name/inspect", controller.InspectContainer)
	v1.GET("/containers/:preName/:name/status", controller.GetContainerStatus)
	v1.POST("/containers/:preName/:name/upload", controller.UploadFile)
	v1.DELETE("/containers/:preName/:name", controller.DeleteContainer)

	v1.POST("/deploy", controller.DeployImage)
	v1.POST("/deploy/batch", controller.BatchDeployImage)
	v1.POST("/deploy/version", controller.DeployVersion)

	// traefik shortcuts
	v1.POST("/deploy/traefik", controller.DeployTraefik)
	v1.DELETE("/deploy/traefik", controller.DeleteTraefik)

	v1.GET("/versions/:instance", controller.GetVersion)

	r.GET("/version", version.VersionForGin)
	v1.GET("version", version.VersionForGin)

	v1.GET("/swagger", swaggerRedirect)
	r.GET("swagger", swaggerRedirect)

	docs.SwaggerInfo.BasePath = "/v1"
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	return r
}

func swaggerRedirect(c *gin.Context) {
	c.Redirect(http.StatusPermanentRedirect, "/swagger/index.html")
}
