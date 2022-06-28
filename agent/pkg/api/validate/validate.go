package validate

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"

	"github.com/go-playground/validator/v10"

	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"
)

// RouterWithValidators that loads validators after creating routes
func RouterWithValidators(g *gin.Engine, routerFunc func(*gin.Engine) *gin.Engine) *gin.Engine {
	g = routerFunc(g)
	SetupValidators()
	return g
}

// SetupValidators is a function to load custom validators
func SetupValidators() {
	log.Println("Loading custom validators...")
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		err := v.RegisterValidation("validSize", v1.ValidSize)
		if err != nil {
			log.Println("Size validation binding error: ", err)
		} else {
			log.Println("Size validator is loaded")
		}
	}
}
