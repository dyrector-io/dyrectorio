package utils

import (
	"github.com/gin-gonic/gin"

	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/config"
)

func GetConfigFromGin(c *gin.Context) *config.Configuration {
	return util.ConfigMiddlewareGet(c).(*config.Configuration)
}
