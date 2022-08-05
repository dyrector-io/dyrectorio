package util

import (
	"bytes"
	"fmt"
	"io"
	"log"

	"github.com/gin-gonic/gin"
)

const configMiddlewareField = "Cfg"

func RequestLogger() gin.HandlerFunc {
	log.Println("Applying request logger middleware")
	return func(c *gin.Context) {
		var buf bytes.Buffer
		if c.Request.Body != nil {
			tee := io.TeeReader(c.Request.Body, &buf)
			body, _ := io.ReadAll(tee)
			c.Request.Body = io.NopCloser(&buf)
			log.Println("Head: " + fmt.Sprint(c.Request.Header))
			log.Println("Body: " + string(body))
		}
		c.Next()
	}
}

func ConfigMiddleware(cfg interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set(configMiddlewareField, cfg)

		c.Next()
	}
}

func ConfigMiddlewareGet(c *gin.Context) interface{} {
	return c.MustGet(configMiddlewareField)
}
