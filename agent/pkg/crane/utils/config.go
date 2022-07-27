package utils

import (
	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"
	"github.com/gin-gonic/gin"
)

func GetConfigFromGin(c *gin.Context) *config.Configuration {
	return util.ConfigMiddlewareGet(c).(*config.Configuration)
}
