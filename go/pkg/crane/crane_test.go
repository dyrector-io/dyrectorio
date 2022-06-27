//go:build integration
// +build integration

package crane_test

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/AlekSi/pointer"
	"github.com/gin-gonic/gin"
	"github.com/lithammer/shortuuid/v4"
	"github.com/stretchr/testify/assert"
	"gitlab.com/dyrector_io/dyrector.io/go/internal/util"
	v1 "gitlab.com/dyrector_io/dyrector.io/go/pkg/api/v1"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/api/validate"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/crane/config"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/crane/k8s"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/crane/route"
)

type DeployRoutes string

const (
	DeployNew         DeployRoutes = "/v1/deploy"
	DeployList        DeployRoutes = "/v1/deployments"
	DeploymentStatus  DeployRoutes = "/v1/containers/%s/%s/status"
	DeploymentLog     DeployRoutes = "/v1/containers/%s/%s/logs"
	DeploymentInspect DeployRoutes = "/v1/containers/%s/%s/inspect"
)

var TestNamespace string
var TestContainerPre string

func createDeployRequest(ctx context.Context, body io.Reader) *http.Request {
	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, string(DeployNew), body)
	req.Header.Set("Content-Type", "application/json")
	return req
}

// TestMain function is executed first can be used to initialize
// test variables and tear down on finish
func TestMain(m *testing.M) {
	// executed before every tests in this file
	uuid := strings.ToLower(shortuuid.New())
	TestNamespace = util.JoinV("-", "crane-test", uuid)
	TestContainerPre = "t"
	// end-before section

	exitVal := m.Run()

	// following is executed after every tests are run in this file

	err := k8s.DeleteNamespace(TestNamespace)
	if err != nil {
		log.Println("(cleanup) failed to delete namespace: ", err)
	}

	os.Exit(exitVal)
}

/*
// TODO: create tests for delete and status functions
func createDeleteRequest(ctx context.Context, namespace, name string) *http.Request {
	req, _ := http.NewRequestWithContext(
		ctx,
		http.MethodDelete,
		util.JoinV("/", string(DeployNew), namespace, name),
		&bytes.Buffer{})
	return req
}
*/

func TestDeploySimpleHappy(t *testing.T) {
	g := gin.Default()
	router := validate.RouterWithValidators(g, route.SetupRouterV1)

	containerConfigBytes, _ := json.Marshal(map[string]interface{}{
		"container": util.JoinV("-", TestContainerPre, "simple-happy"),
		"mount":     []string{"config|/app/config"},
	})

	body := map[string]interface{}{
		"RequestId": "12346",
		"ImageName": "nginx",
		"Tag":       "latest",
		"InstanceConfig": base64.StdEncoding.EncodeToString(
			[]byte(fmt.Sprintf(`{"containerPreName": "%v"}`, TestNamespace)),
		),
		"ContainerConfig": base64.StdEncoding.EncodeToString(containerConfigBytes),
	}

	t.Run("basic happy deployment", func(t *testing.T) {
		rec := httptest.NewRecorder()
		byt, _ := json.Marshal(body)
		router.ServeHTTP(rec, createDeployRequest(context.TODO(), bytes.NewReader(byt)))
		assert.Equal(t, http.StatusOK, rec.Code)
	})
}

func TestDeployFieldConflictSad(t *testing.T) {
	g := gin.Default()
	router := validate.RouterWithValidators(g, route.SetupRouterV1)

	containerConfigBytes, _ := json.Marshal(map[string]interface{}{
		"container": util.JoinV("-", TestContainerPre, "conflict-sad"),
		"mount":     []string{"config|/app/config"},
	})

	body := map[string]interface{}{
		"RequestId": "12346",
		"ImageName": "nginx",
		"Tag":       "latest",
		"InstanceConfig": base64.StdEncoding.EncodeToString(
			[]byte(fmt.Sprintf(`{"containerPreName": "%v"}`, TestNamespace)),
		),
		"ContainerConfig": base64.StdEncoding.EncodeToString(containerConfigBytes),
	}

	rec := httptest.NewRecorder()
	byt, _ := json.Marshal(body)
	router.ServeHTTP(rec, createDeployRequest(context.TODO(), bytes.NewReader(byt)))
	assert.Equal(t, http.StatusOK, rec.Code)

	t.Run("basic happy deployment for conflicts", func(t *testing.T) {
		util.ReadConfig(&config.Cfg)

		config.Cfg.FieldManagerName = "crane-test-conflict"
		config.Cfg.ForceOnConflicts = false

		rec := httptest.NewRecorder()
		byt, _ := json.Marshal(body)
		router.ServeHTTP(rec, createDeployRequest(context.TODO(), bytes.NewReader(byt)))
		assert.Equal(t, http.StatusOK, rec.Code)
	})

}

func TestDeployFieldConflictHappy(t *testing.T) {
	g := gin.Default()
	router := validate.RouterWithValidators(g, route.SetupRouterV1)

	containerConfigBytes, _ := json.Marshal(map[string]interface{}{
		"container": util.JoinV("-", TestContainerPre, "conflict-happy"),
		"mount":     []string{"config|/app/config"},
	})

	body := map[string]interface{}{
		"RequestId": "12346",
		"ImageName": "nginx",
		"Tag":       "latest",
		"InstanceConfig": base64.StdEncoding.EncodeToString(
			[]byte(fmt.Sprintf(`{"containerPreName": "%v"}`, TestNamespace)),
		),
		"ContainerConfig": base64.StdEncoding.EncodeToString(containerConfigBytes),
	}

	t.Run("basic happy deployment", func(t *testing.T) {
		rec := httptest.NewRecorder()
		byt, _ := json.Marshal(body)
		router.ServeHTTP(rec, createDeployRequest(context.TODO(), bytes.NewReader(byt)))
		assert.Equal(t, http.StatusOK, rec.Code)
	})
}

func TestDeploySimpleWithConfigContainerHappy(t *testing.T) {
	g := gin.Default()
	router := validate.RouterWithValidators(g, route.SetupRouterV1)

	containerConfigBytes, _ := json.Marshal(map[string]interface{}{
		"container": util.JoinV("-", TestContainerPre, "simple-config-container-happy"),
		"mount":     []string{"config|/app/config"},
		"configContainer": map[string]string{
			"image":  "reg.sunilium.com/dyrectorio/helios-dyo-config:rofu",
			"volume": "config",
			"path":   "/config/mtf-api-application/config/**",
		},
	})
	body := map[string]string{
		"RequestId": "54321",
		"ImageName": "nginx",
		"Tag":       "latest",
		"InstanceConfig": base64.StdEncoding.EncodeToString(
			[]byte(fmt.Sprintf(`{"containerPreName": "%v"}`, TestNamespace)),
		),
		"ContainerConfig": base64.StdEncoding.EncodeToString(containerConfigBytes),
	}

	t.Run("basic deployment", func(t *testing.T) {
		rec := httptest.NewRecorder()
		byt, _ := json.Marshal(body)
		router.ServeHTTP(rec, createDeployRequest(context.TODO(), bytes.NewReader(byt)))
		assert.Equal(t, http.StatusOK, rec.Code)
	})
}

// TestDeploymentPVCExtensionFailSad after a deployment is deployed, pvc is attached
// if a storage class doesn't support expansion the deployment should fail
func TestDeploymentPVCExtensionFailSad(t *testing.T) {
	g := gin.Default()
	router := validate.RouterWithValidators(g, route.SetupRouterV1)

	containerName := util.JoinV("-", TestContainerPre, "pvc-mixed")

	deployRequest := v1.DeployImageRequest{
		RequestID: "test-pvc-1",
		Tag:       "latest",
		InstanceConfig: v1.InstanceConfig{
			ContainerPreName: TestNamespace,
		},
		ContainerConfig: v1.ContainerConfig{
			Container: containerName,
			Volumes: []v1.Volume{
				{
					Name: "pvc-size-200m",
					Path: "/data",
					Size: "200M",
				},
			},
		},
		ImageName: "nginx",
	}

	body, err := json.Marshal(deployRequest)

	if err != nil {
		t.Error(err)
	}

	t.Run("deploy with pvc step-1", func(t *testing.T) {
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, createDeployRequest(context.TODO(), bytes.NewReader(body)))
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	k8s.WaitForRunningDeployment(TestNamespace, containerName, 1, config.Cfg.TestTimeoutDuration)

	// modify pvc size
	deployRequest.ContainerConfig.Volumes[0].Size = "256M"

	body, err = json.Marshal(deployRequest)
	if err != nil {
		t.Error(err)
	}

	t.Run("deploy with pvc step-2-sad", func(t *testing.T) {
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, createDeployRequest(context.TODO(), bytes.NewReader(body)))
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})
}

// TestDeploymentPVCExtensionFailSad after a deployment is deployed, pvc is attached
// if a storage class doesn't support expansion the deployment should fail
func TestDeploymentRestartAllTheTimeHappy(t *testing.T) {
	g := gin.Default()
	router := validate.RouterWithValidators(g, route.SetupRouterV1)

	containerName := "restart-me"

	deployRequest := v1.DeployImageRequest{
		RequestID: "test-restart-1",
		Tag:       "latest",
		InstanceConfig: v1.InstanceConfig{
			ContainerPreName: TestNamespace,
		},
		ContainerConfig: v1.ContainerConfig{
			Container: containerName,
		},
		ImageName: "nginx",
		Issuer:    "dyrector-io-test-case-restart-1",
	}

	body, err := json.Marshal(deployRequest)

	if err != nil {
		t.Error(err)
	}

	t.Run("deploy with restart and issuer", func(t *testing.T) {
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, createDeployRequest(context.TODO(), bytes.NewReader(body)))
		assert.Equal(t, http.StatusOK, rec.Code)
		log.Println(rec.Body)
	})

	k8s.WaitForRunningDeployment(TestNamespace, containerName, 1, config.Cfg.TestTimeoutDuration)

	body, err = json.Marshal(deployRequest)
	if err != nil {
		t.Error(err)
	}

	t.Run("deploy again expecting a restart to happen", func(t *testing.T) {
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, createDeployRequest(context.TODO(), bytes.NewReader(body)))
		assert.Equal(t, http.StatusOK, rec.Code)
		log.Println(rec.Body)
	})
}

// TestDeploymentPVCExtensionFailSad after a deployment is deployed, pvc is attached
// if a storage class doesn't support expansion the request should fail
func TestDeploymentPVCInvalidSizeSad(t *testing.T) {
	g := gin.Default()
	router := validate.RouterWithValidators(g, route.SetupRouterV1)

	deployRequest := &v1.DeployImageRequest{
		RequestID: "test-pvc-2",
		Tag:       "latest",
		InstanceConfig: v1.InstanceConfig{
			ContainerPreName: TestNamespace,
		},
		ContainerConfig: v1.ContainerConfig{
			Container: util.JoinV("-", TestContainerPre, "pvc-too-big"),
			Volumes: []v1.Volume{
				{
					Name: "pvc-size-10t",
					Path: "/data",
					Size: "10Cs",
				},
			},
		},
		ImageName: "nginx",
	}

	body, err := json.Marshal(*deployRequest)

	if err != nil {
		t.Error(err)
	}

	t.Run("deploy with pvc with invalid storage request size", func(t *testing.T) {
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, createDeployRequest(context.TODO(), bytes.NewReader(body)))
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})

	body, err = json.Marshal(*deployRequest)
	if err != nil {
		t.Error(err)
	}
}

func TestDeploySimpleBodyNoImageSad(t *testing.T) {
	g := gin.Default()
	router := validate.RouterWithValidators(g, route.SetupRouterV1)
	body := map[string]interface{}{
		"RequestId": "12345",
		"InstanceConfig": base64.StdEncoding.EncodeToString(
			[]byte(fmt.Sprintf(`{"containerPreName": "%v"}`, TestNamespace)),
		),
		"ContainerConfig": base64.StdEncoding.EncodeToString(
			[]byte(fmt.Sprintf(`{"container": "%v"}`, util.JoinV("-", TestContainerPre, "deploy-no-image-sad"))),
		),
	}

	t.Run("incomplete deployment - missing image", func(t *testing.T) {
		rec := httptest.NewRecorder()
		byt, _ := json.Marshal(body)
		router.ServeHTTP(rec, createDeployRequest(context.TODO(), bytes.NewReader(byt)))
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})
}

func TestDeploySimpleBodyEmptySad(t *testing.T) {
	g := gin.Default()
	router := validate.RouterWithValidators(g, route.SetupRouterV1)

	t.Run("incomplete deployment - empty body", func(t *testing.T) {
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, createDeployRequest(context.TODO(), nil))
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})
}

func TestDeployAndGetStatus(t *testing.T) {
	g := gin.Default()
	router := validate.RouterWithValidators(g, route.SetupRouterV1)

	containerName := "status-test-1"
	deployRequest := v1.DeployImageRequest{
		RequestID: "status-test-req-1",
		Tag:       "latest",
		InstanceConfig: v1.InstanceConfig{
			ContainerPreName: TestNamespace,
		},
		ContainerConfig: v1.ContainerConfig{
			Container: containerName,
		},
		Registry:  pointer.ToString("registry.hub.docker.com/library"),
		ImageName: "nginx",
		Issuer:    "dyrector-io-test-case-status-1",
	}

	b, err := json.Marshal(deployRequest)
	if err != nil {
		t.Error(err)
	}
	t.Run("deploy for status check tests", func(t *testing.T) {
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, createDeployRequest(context.TODO(), bytes.NewReader(b)))
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	err = k8s.WaitForRunningDeployment(TestNamespace, containerName, 1, config.Cfg.TestTimeoutDuration)

	if err != nil {
		t.Fatal(err)
	}

	t.Run("fetch status", func(t *testing.T) {
		rec := httptest.NewRecorder()
		req, _ := http.NewRequestWithContext(context.TODO(), http.MethodGet, fmt.Sprintf(string(DeploymentStatus), TestNamespace, containerName), nil)
		router.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("fetch logs", func(t *testing.T) {
		rec := httptest.NewRecorder()
		req, _ := http.NewRequestWithContext(context.TODO(), http.MethodGet, fmt.Sprintf(string(DeploymentLog), TestNamespace, containerName), nil)
		router.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("fetch inspect", func(t *testing.T) {
		rec := httptest.NewRecorder()
		req, _ := http.NewRequestWithContext(context.TODO(), http.MethodGet, fmt.Sprintf(string(DeploymentInspect), TestNamespace, containerName), nil)
		router.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)
	})
}

func TestWaitDeploymentHappy(t *testing.T) {
	g := gin.Default()
	router := validate.RouterWithValidators(g, route.SetupRouterV1)

	containerName := "wait-me-1"
	deployRequest := v1.DeployImageRequest{
		RequestID: "waiter-test-req-1",
		InstanceConfig: v1.InstanceConfig{
			ContainerPreName: TestNamespace,
		},
		ContainerConfig: v1.ContainerConfig{
			Container: containerName,
		},
		Registry:  pointer.ToString("registry.hub.docker.com/library"),
		ImageName: "nginx",
		Tag:       "latest",
		Issuer:    "dyrector-io-test-waiter-1",
	}

	b, err := json.Marshal(deployRequest)
	if err != nil {
		t.Error(err)
	}
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, createDeployRequest(context.TODO(), bytes.NewReader(b)))
	assert.Equal(t, http.StatusOK, rec.Code)
	log.Println("body:", rec.Body)

	t.Run("wait for deployment to be running", func(t *testing.T) {
		err = k8s.WaitForRunningDeployment(TestNamespace, containerName, 1, config.Cfg.TestTimeoutDuration)
		if err != nil {
			t.Fatal(err)
		}
		assert.Nil(t, err, "Error has to be nil if queried object is valid")
	})
}

func TestTimeoutIfConditionFailsSad(t *testing.T) {
	g := gin.Default()
	router := validate.RouterWithValidators(g, route.SetupRouterV1)

	containerName := "wait-me-2"
	deployRequest := v1.DeployImageRequest{
		RequestID: "waiter-test-req-2",
		Tag:       "latest",
		InstanceConfig: v1.InstanceConfig{
			ContainerPreName: TestNamespace,
		},
		ContainerConfig: v1.ContainerConfig{
			Container: containerName,
		},
		ImageName: "nginx",
		Issuer:    "dyrector-io-test-waiter-2",
	}

	b, err := json.Marshal(deployRequest)
	if err != nil {
		t.Error(err)
	}
	t.Run("deploy for status check tests", func(t *testing.T) {
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, createDeployRequest(context.TODO(), bytes.NewReader(b)))
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t1 := time.Now()
	err = k8s.WaitForRunningDeployment(TestNamespace, containerName, 2, config.Cfg.TestTimeoutDuration)

	assert.NotNil(t, err, "Error has to occur if condition is not fulfilled")
	assert.True(t, t1.Before(time.Now().Add(config.Cfg.TestTimeoutDuration)))
}
