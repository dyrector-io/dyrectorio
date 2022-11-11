//go:build unit
// +build unit

package v1_test

import (
	"encoding/base64"
	"testing"

	"github.com/stretchr/testify/assert"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

func TestSetDeploymentDefaults(t *testing.T) {
	req := v1.DeployImageRequest{}

	fakeRegistry := "index.obviouslyfake.com"
	defaultTag := "coleslaw"

	v1.SetDeploymentDefaults(&req, &config.CommonConfiguration{
		DefaultRegistry: fakeRegistry,
		DefaultTag:      defaultTag,
	})

	assert.Equal(t, fakeRegistry, *req.Registry)
	assert.Equal(t, defaultTag, req.Tag)
	assert.Equal(t, "unless-stopped", string(req.ContainerConfig.RestartPolicy))
}

func TestDeploymentImageRequestStrings(t *testing.T) {
	d := v1.DeployImageRequest{
		ImageName: "test-image",
		Tag:       "test-tag",
		InstanceConfig: v1.InstanceConfig{
			ContainerPreName: "prefix",
		},
		ContainerConfig: v1.ContainerConfig{
			Container: "test-container",
			Ports: []container.PortBinding{
				{
					ExposedPort: 1234,
					PortBinding: 4321,
				},
				{
					ExposedPort: 6789,
					PortBinding: 9876,
				},
			},
		},
	}

	cfg := config.CommonConfiguration{
		IngressRootDomain: "my-root-domain.com",
	}

	// Without registry
	s := d.Strings(&cfg)
	assert.Equal(t, []string{
		"Deployment target: my-root-domain.com\n",
		"Image: test-image:test-tag\n",
		"Registry: default\n",
		"Container name: prefix-test-container\n",
		"Exposed ports: [{1234 4321} {6789 9876}]\n",
	}, s)

	// With registry
	r := "https://my-regstry.org"
	d.Registry = &r

	s = d.Strings(&cfg)
	assert.Equal(t, []string{
		"Deployment target: my-root-domain.com\n",
		"Image: test-image:test-tag\n",
		"Registry: https://my-regstry.org\n",
		"Container name: prefix-test-container\n",
		"Exposed ports: [{1234 4321} {6789 9876}]\n",
	}, s)
}

func TestInstanceConfigStrings(t *testing.T) {
	i := v1.InstanceConfig{
		ContainerPreName: "my-prefix",
	}

	s := i.Strings()
	assert.Equal(t, []string{"Prefix: my-prefix"}, s)
}

func TestContainerConfigStrings(t *testing.T) {
	var uid int64 = 777
	appCfg := config.CommonConfiguration{
		DefaultLimitsCPU:    "4.0",
		DefaultLimitsMemory: "512mb",
	}

	// test empty config
	cfg := v1.ContainerConfig{}

	s := cfg.Strings(&appCfg)
	assert.Equal(t, []string{
		"Exposed: false",
		"Memory limit: 512mb, CPU limit: 4.0",
	}, s)

	// Test full config
	cfg = v1.ContainerConfig{
		Container: "test-container",
		Ports: []container.PortBinding{
			{
				ExposedPort: 1234,
				PortBinding: 4321,
			},
			{
				ExposedPort: 6789,
				PortBinding: 9876,
			},
		},
		PortRanges: []container.PortRangeBinding{
			{
				Internal: container.PortRange{
					From: 25,
					To:   678,
				},
				External: container.PortRange{
					From: 999,
					To:   1200,
				},
			},
			{
				Internal: container.PortRange{
					From: 6500,
					To:   7000,
				},
				External: container.PortRange{
					From: 9000,
					To:   9999,
				},
			},
		},
		Expose: true,
		Mounts: []string{"VolA", "VolB"},
		Volumes: []v1.Volume{
			{
				Name:  "VolA",
				Type:  "broken",
				Path:  "/path/to/storage/A",
				Size:  "2Tb",
				Class: "storage-classA",
			},
			{
				Name:  "VolB",
				Type:  "not-broken",
				Path:  "/path/to/storage/B",
				Size:  "2Tb",
				Class: "storage-classA",
			},
		},
		InitContainers: []v1.InitContainer{
			{
				Name:      "initA",
				Command:   []string{"rm"},
				Args:      []string{"-rf", "/"},
				Image:     "https://my-registry.com/imageA:latest",
				UseParent: false,
				Envs:      map[string]string{"GOPATH": "/path/to/go"},
				Volumes: []v1.VolumeLink{
					{
						Name: "VolA",
						Path: "/different/path/to/storage",
					},
				},
			},
			{
				Name:      "initB",
				Command:   []string{"rm"},
				Args:      []string{"-rf", "/"},
				Image:     "https://my-registry.com/imageB:latest",
				UseParent: false,
				Envs:      map[string]string{"GOPATH": "/path/to/go"},
				Volumes: []v1.VolumeLink{
					{
						Name: "VolB",
						Path: "/different/path/to/storage",
					},
				},
			},
		},
		User: &uid,
	}

	s = cfg.Strings(&appCfg)
	assert.Equal(t, []string{
		"Ports: [{1234 4321} {6789 9876}]",
		"PortRanges: [{{25 678} {999 1200}} {{6500 7000} {9000 9999}}]",
		"Exposed: true",
		"Mounts: [VolA VolB]",
		"Volumes: [{VolA /path/to/storage/A 2Tb broken storage-classA} {VolB /path/to/storage/B 2Tb not-broken storage-classA}]",
		"Init containers: [initA initB]",
		"Memory limit: 512mb, CPU limit: 4.0",
		"User: 777",
	}, s)
}

func TestUnmarshalJSON(t *testing.T) {
	j := v1.Base64JSONBytes{}

	err := j.UnmarshalJSON([]byte("this is not base64"))
	assert.Error(t, err)

	b := `
{
	"itemA": 1,
	// a comment
	"itemB": "some string",
}`
	expect := `
{
	"itemA": 1,
	"itemB": "some string",
}`

	err = j.UnmarshalJSON([]byte(base64.StdEncoding.EncodeToString([]byte(b))))
	assert.NoError(t, err)
	assert.Equal(t, expect, string(j))
}
