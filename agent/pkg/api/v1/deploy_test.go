//go:build unit
// +build unit

package v1_test

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/agent/internal/config"
	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"
)

func TestInstanceConfigMarshalEmpty(t *testing.T) {
	empty := v1.InstanceConfig{}
	res, err := json.Marshal(empty)
	if err != nil {
		t.Error("Instance config marshal test error:" + err.Error())
	}

	assert.Equal(t, []byte(`{"containerPreName":"","mountPath":"","name":"","registry":"","repositoryPreName":"","useSharedEnvs":false}`), res)
	assert.Nil(t, err)
}

func TestInstanceConfigMarshalValid(t *testing.T) {
	config := v1.InstanceConfig{
		ContainerPreName: "pre-name",
	}
	res, err := json.Marshal(config)
	if err != nil {
		t.Error("instance config marshal test error: " + err.Error())
	}

	assert.Equal(t, []byte(`{"containerPreName":"pre-name","mountPath":"","name":"","registry":"","repositoryPreName":"","useSharedEnvs":false}`), res)
	assert.Nil(t, err)
}

func TestInstanceConfigUnmarshalValid(t *testing.T) {
	var res v1.InstanceConfig

	inStr := `{"containerPreName":"pre-name"}`
	err := json.Unmarshal([]byte(inStr), &res)

	if err != nil {
		t.Error("Instance config test unmarshal error: " + err.Error())
	}

	assert.Equal(t, "pre-name", res.ContainerPreName)
	assert.Nil(t, err)
}

func TestInstanceConfigBadBrackets(t *testing.T) {
	var res v1.InstanceConfig

	inStr := `{
			"containerPreName":"pre-name",
			"environment": "THIS|BAD_EXAMPLE"
		}`
	err := json.Unmarshal([]byte(inStr), &res)

	assert.IsType(t, &json.UnmarshalTypeError{}, err)
}

func TestContainerConfigUnmarshalValid(t *testing.T) {
	var res v1.ContainerConfig

	inStr := `{"container":"nginx"}`
	err := json.Unmarshal([]byte(inStr), &res)

	if err != nil {
		t.Error("Container config test unmarshal error: " + err.Error())
	}

	assert.Equal(t, "nginx", res.Container)
	assert.Nil(t, err)
}

func TestRestartPolicyMarshalEmptyLoadDefault(t *testing.T) {
	empty := v1.RestartPolicyName("")
	res, err := json.Marshal(empty)
	if err != nil {
		t.Error(err)
	}

	assert.Equal(t, []byte(fmt.Sprintf(`%q`, "unless-stopped")), res)
	assert.Nil(t, err)
}

func TestRestartPolicyMarshalValidUnless(t *testing.T) {
	policy := v1.RestartUnlessStoppedRestartPolicy
	res, err := json.Marshal(policy)
	if err != nil {
		t.Error(err)
	}

	assert.Equal(t, []byte(fmt.Sprintf("%q", "unless-stopped")), res)
	assert.Nil(t, err)
}

func TestRestartPolicyUnmarshalEmpty(t *testing.T) {
	var res v1.ContainerConfig
	err := json.Unmarshal([]byte(""), &res)

	assert.Empty(t, res.RestartPolicy)
	assert.IsType(t, &json.SyntaxError{}, err)
}

func TestRestartPolicyUnmarshalProvidedUnlessStopped(t *testing.T) {
	strIn := `{"restartPolicy": "unless-stopped"}`

	var res v1.ContainerConfig
	bytes := []byte(strIn)
	err := json.Unmarshal(bytes, &res)

	if err != nil {
		t.Error(err)
	}

	assert.Equal(t, v1.RestartUnlessStoppedRestartPolicy, res.RestartPolicy)
	assert.Nil(t, err)
}

func TestRestartPolicyUnmarshalProvidedInvalid(t *testing.T) {
	strIn := `{
		"restartPolicy": "uzenetleventenek"
	}`

	var res v1.ContainerConfig
	err := json.Unmarshal([]byte(strIn), &res)

	assert.Equal(t, v1.RestartPolicyName(""), res.RestartPolicy)
	assert.IsType(t, &v1.ErrRestartPolicyUnmarshalInvalid{}, err)
}

func TestRestartPolicyUnmarshalNumberError(t *testing.T) {
	strIn := base64.StdEncoding.EncodeToString([]byte(`{
		"restartPolicy": 3.14
	}`))

	var res v1.ContainerConfig
	err := json.Unmarshal([]byte(fmt.Sprintf("%q", strIn)), &res)

	fmt.Println("Error: ", err)
	assert.Equal(t, v1.RestartPolicyName(""), res.RestartPolicy)
	assert.IsType(t, &json.UnmarshalTypeError{}, err)
}

func TestRestartPolicyUnmarshalProvidedNotProvided(t *testing.T) {
	strIn := `{
		"containerPreName": "anything"
	}`

	var res v1.ContainerConfig
	err := json.Unmarshal([]byte(strIn), &res)
	if err != nil {
		t.Error(err)
	}

	assert.Equal(t, res.RestartPolicy, v1.RestartPolicyName(""))
	assert.Nil(t, err)
}

func TestSetDeploymentDefaults(t *testing.T) {
	req := v1.DeployImageRequest{}

	fakeRegistry := "index.obviouslyfake.com"
	defaultTag := "coleslaw"

	v1.SetDeploymentDefaults(&req, &config.CommonConfiguration{
		Registry:   fakeRegistry,
		DefaultTag: defaultTag,
	})

	assert.Equal(t, fakeRegistry, *req.Registry)
	assert.Equal(t, defaultTag, req.Tag)
	assert.Equal(t, "unless-stopped", string(req.ContainerConfig.RestartPolicy))
}
