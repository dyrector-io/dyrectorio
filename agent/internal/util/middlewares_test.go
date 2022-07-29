package util_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

type TestConfig struct {
	testField int
}

func TestConfigMiddlewarePointer(t *testing.T) {
	cfg := &TestConfig{
		testField: 42,
	}

	g := gin.Default()
	g.Use(util.ConfigMiddleware(cfg))

	g.GET("/test", func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				t.Fatal(err)
			}
		}()

		cfgFromMiddleware := util.ConfigMiddlewareGet(c)

		assert.Equal(t, cfg, cfgFromMiddleware)
		assert.Equal(t, cfg.testField, 42)

		c.Status(http.StatusOK)
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequestWithContext(context.Background(), "GET", "/test", nil)
	g.ServeHTTP(w, req)
}

func TestConfigMiddlewareNil(t *testing.T) {
	g := gin.Default()
	g.Use(util.ConfigMiddleware(nil))

	g.GET("/test", func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				t.Fatal(err)
			}
		}()

		cfgFromMiddleware := util.ConfigMiddlewareGet(c)

		assert.Equal(t, nil, cfgFromMiddleware)

		c.Status(http.StatusOK)
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequestWithContext(context.Background(), "GET", "/test", nil)
	g.ServeHTTP(w, req)
}

func TestConfigModification(t *testing.T) {
	cfg := &TestConfig{
		testField: 42,
	}

	g := gin.Default()
	g.Use(util.ConfigMiddleware(cfg))

	g.GET("/test", func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				t.Fatal(err)
			}
		}()

		cfgFromMiddleware := util.ConfigMiddlewareGet(c)

		assert.Equal(t, cfg, cfgFromMiddleware)
		assert.Equal(t, cfg.testField, 52)

		c.Status(http.StatusOK)
	})

	cfg.testField = 52

	w := httptest.NewRecorder()
	req, _ := http.NewRequestWithContext(context.Background(), "GET", "/test", nil)
	g.ServeHTTP(w, req)
}
