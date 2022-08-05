//go:build integration
// +build integration

package routes_test

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os/exec"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"
	builder "github.com/dyrector-io/dyrectorio/agent/pkg/containerbuilder"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/config"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/routes"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/utils"
)

var nginxImageName string = "nginx"
var reqID string = "test-12345"

func createGin() *gin.Engine {
	g := gin.Default()

	g.Use(util.ConfigMiddleware(&config.Configuration{}))

	return g
}

func TestContainerList(t *testing.T) {
	g := createGin()
	router := routes.SetupRouter(g)

	dockerRunning := false
	cmd := exec.Command("docker", "ps")
	if err := cmd.Run(); err != nil {
		t.Error("docker check failed, daemon probably not running")
		t.Error(err.Error())
	} else {
		dockerRunning = true
	}

	if dockerRunning {
		w := httptest.NewRecorder()
		req, _ := http.NewRequestWithContext(context.Background(), "GET", "/v1/containers", http.NoBody)
		router.ServeHTTP(w, req)

		assert.Equal(t, 200, w.Code)
		var result map[string]interface{}
		err := json.NewDecoder(w.Body).Decode(&result)
		if err != nil {
			t.Error(err)
		}
		assert.Nil(t, err)
	} else {
		w := httptest.NewRecorder()
		req, _ := http.NewRequestWithContext(context.Background(), "GET", "/v1/containers", http.NoBody)
		router.ServeHTTP(w, req)

		assert.Equal(t, 500, w.Code)
	}
}

// reg.dyrector.io/library/nginx-labeled:latest

// this test does nothing special with labels
func TestLabelDeploy(t *testing.T) {
	g := createGin()
	router := routes.SetupRouter(g)

	w := httptest.NewRecorder()

	imageName := "nginx"

	body, _ := json.Marshal(v1.DeployImageRequest{
		RequestID: reqID,
		InstanceConfig: v1.InstanceConfig{
			ContainerPreName: "labeltest",
		},
		ContainerConfig: v1.ContainerConfig{
			Container:     "test-2",
			RestartPolicy: builder.OnFailureRestartPolicy,
		},
		ImageName: imageName,
		Tag:       "latest",
	})

	req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/v1/deploy", bytes.NewReader(body))
	router.ServeHTTP(w, req)

	defer func() {
		if err := utils.DeleteContainer("labeltest-test-2"); err != nil {
			t.Error(err)
		}
	}()

	assert.Equal(t, 200, w.Code)
	var result v1.DeployImageResponse
	err := json.NewDecoder(w.Body).Decode(&result)
	if err != nil {
		t.Error(err)
	}
	assert.Nil(t, err)
}

func TestBasicDeploy(t *testing.T) {
	g := createGin()
	router := routes.SetupRouter(g)

	w := httptest.NewRecorder()

	body, _ := json.Marshal(v1.DeployImageRequest{
		RequestID: reqID,
		InstanceConfig: v1.InstanceConfig{
			ContainerPreName: "dagent-test",
		},
		ContainerConfig: v1.ContainerConfig{
			Container:     "test-1",
			RestartPolicy: builder.OnFailureRestartPolicy,
		},
		ImageName: nginxImageName,
		Tag:       "latest",
	})

	req, _ := http.NewRequestWithContext(context.Background(), "POST", "/v1/deploy", bytes.NewReader(body))
	router.ServeHTTP(w, req)

	defer func() {
		time.Sleep(5 * time.Second)
		if err := utils.DeleteContainer("dagent-test-test-1"); err != nil {
			t.Error(err)
		}
	}()

	assert.Equal(t, 200, w.Code)
	var result v1.DeployImageResponse
	err := json.NewDecoder(w.Body).Decode(&result)
	if err != nil {
		t.Error(err)
	}
	assert.Nil(t, err)

	// test status request too
	req, _ = http.NewRequestWithContext(context.Background(), "POST", fmt.Sprintf("/v1/containers/%s/%s/status", "dagent-test", "test-1"), bytes.NewReader(body))
	router.ServeHTTP(w, req)
	assert.Equal(t, 200, w.Code)

	req, _ = http.NewRequestWithContext(context.Background(), http.MethodDelete, "/v1/dagent-test/test-1", bytes.NewReader(body))
	router.ServeHTTP(w, req)
	assert.Equal(t, 200, w.Code)
}

func TestBatchDeploy(t *testing.T) {
	g := createGin()
	router := routes.SetupRouter(g)

	const ContainerName001 = "container-name-001"
	const ContainerName002 = "container-name-002"
	const ContainerName003 = "container-name-003"

	prefix := "dagent-test"

	w := httptest.NewRecorder()

	request := v1.BatchDeployImageRequest{v1.DeployImageRequest{
		RequestID: reqID,
		InstanceConfig: v1.InstanceConfig{
			ContainerPreName:  prefix,
			RepositoryPreName: prefix,
		},
		ContainerConfig: v1.ContainerConfig{
			Container:     ContainerName001,
			RestartPolicy: builder.OnFailureRestartPolicy,
		},
		ImageName: nginxImageName,
		Tag:       "latest",
	}, v1.DeployImageRequest{
		RequestID: reqID,
		InstanceConfig: v1.InstanceConfig{
			ContainerPreName:  prefix,
			RepositoryPreName: prefix,
		},
		ContainerConfig: v1.ContainerConfig{
			Container:     ContainerName002,
			RestartPolicy: builder.OnFailureRestartPolicy,
		},
		ImageName: nginxImageName,
		Tag:       "latest",
	}, v1.DeployImageRequest{
		RequestID: reqID,
		InstanceConfig: v1.InstanceConfig{
			ContainerPreName:  prefix,
			RepositoryPreName: prefix,
		},
		ContainerConfig: v1.ContainerConfig{
			Container:     ContainerName003,
			RestartPolicy: builder.OnFailureRestartPolicy,
		},
		ImageName: nginxImageName,
		Tag:       "latest",
	}}

	body, _ := json.Marshal(request)

	req, _ := http.NewRequestWithContext(context.Background(), "POST", "/v1/deploy/batch", bytes.NewReader(body))
	router.ServeHTTP(w, req)

	defer func() {
		if err := utils.DeleteContainer(util.JoinV("-", prefix, ContainerName001)); err != nil {
			t.Error(err)
		}
		if err := utils.DeleteContainer(util.JoinV("-", prefix, ContainerName002)); err != nil {
			t.Error(err)
		}
		if err := utils.DeleteContainer(util.JoinV("-", prefix, ContainerName003)); err != nil {
			t.Error(err)
		}
	}()

	assert.Equal(t, 200, w.Code)
	var result v1.BatchDeployImageResponse
	err := json.NewDecoder(w.Body).Decode(&result)
	if err != nil {
		t.Error(err)
	}
	assert.Nil(t, err)
}

func TestVersionEndpoint(t *testing.T) {
	g := createGin()
	router := routes.SetupRouter(g)

	w := httptest.NewRecorder()

	req, _ := http.NewRequestWithContext(context.Background(), "GET", "/version", http.NoBody)
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
}
