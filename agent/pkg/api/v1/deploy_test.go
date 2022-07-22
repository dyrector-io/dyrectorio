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

	// base64 content, empty object
	// {"mountPath":"","containerPreName":"","registry":"","repositoryPreName":""}
	//nolint
	assert.Equal(t, []byte(`"eyJjb250YWluZXJQcmVOYW1lIjoiIiwibW91bnRQYXRoIjoiIiwibmFtZSI6IiIsInJlZ2lzdHJ5IjoiIiwicmVwb3NpdG9yeVByZU5hbWUiOiIiLCJ1c2VTaGFyZWRFbnZzIjpmYWxzZX0="`), res)
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

	//nolint
	assert.Equal(t, []byte(`"eyJjb250YWluZXJQcmVOYW1lIjoicHJlLW5hbWUiLCJtb3VudFBhdGgiOiIiLCJuYW1lIjoiIiwicmVnaXN0cnkiOiIiLCJyZXBvc2l0b3J5UHJlTmFtZSI6IiIsInVzZVNoYXJlZEVudnMiOmZhbHNlfQ=="`),
		res)
	assert.Nil(t, err)
}

func TestInstanceConfigUnmarshalValid(t *testing.T) {
	var res v1.InstanceConfig

	inStr := `{"containerPreName":"pre-name"}`
	encoded := base64.StdEncoding.EncodeToString([]byte(inStr))
	err := json.Unmarshal([]byte(fmt.Sprintf("%q", encoded)), &res)

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
	encoded := base64.StdEncoding.EncodeToString([]byte(inStr))
	err := json.Unmarshal([]byte(fmt.Sprintf("%q", encoded)), &res)

	assert.IsType(t, &json.UnmarshalTypeError{}, err)
}

func TestInstanceConfigInvalidBase64(t *testing.T) {
	var res v1.InstanceConfig

	inStr := `{
			"containerPreName":"pre-name"
		}`
	encoded := base64.StdEncoding.EncodeToString([]byte(inStr))
	encoded += "ezyx"
	err := json.Unmarshal([]byte(fmt.Sprintf("%q", encoded)), &res)

	assert.IsType(t, base64.CorruptInputError(0), err)
}

func TestContainerConfigUnmarshalValid(t *testing.T) {
	var res v1.ContainerConfig

	inStr := `{"container":"nginx"}`
	encoded := base64.StdEncoding.EncodeToString([]byte(inStr))
	err := json.Unmarshal([]byte(fmt.Sprintf("%q", encoded)), &res)

	if err != nil {
		t.Error("Container config test unmarshal error: " + err.Error())
	}

	assert.Equal(t, "nginx", res.Container)
	assert.Nil(t, err)
}

func TestRuntimeConfigUnmarshalValid(t *testing.T) {
	var res v1.Base64JSONBytes

	inStr := `"eyJjb250YWluZXIiOiJuZ2lueCJ9"`
	err := json.Unmarshal([]byte(inStr), &res)

	assert.Nil(t, err)
	assert.Equal(t, `{"container":"nginx"}`, string(res))
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
	strIn := base64.StdEncoding.EncodeToString([]byte(`{"restartPolicy": "unless-stopped"}`))

	var res v1.ContainerConfig
	bytes := []byte((fmt.Sprintf("%q", strIn)))
	err := json.Unmarshal(bytes, &res)

	if err != nil {
		t.Error(err)
	}

	assert.Equal(t, v1.RestartUnlessStoppedRestartPolicy, res.RestartPolicy)
	assert.Nil(t, err)
}

func TestRestartPolicyUnmarshalProvidedInvalid(t *testing.T) {
	strIn := base64.StdEncoding.EncodeToString([]byte(`{
		"restartPolicy": "uzenetleventenek"
	}`))

	var res v1.ContainerConfig
	err := json.Unmarshal([]byte(fmt.Sprintf("%q", strIn)), &res)

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
	strIn := base64.StdEncoding.EncodeToString([]byte(`{
		"containerPreName": "anything"
	}`))

	var res v1.ContainerConfig
	err := json.Unmarshal([]byte(fmt.Sprintf("%q", strIn)), &res)
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
