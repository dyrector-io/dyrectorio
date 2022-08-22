//go:build unit
// +build unit

package k8s_test

import (
	"testing"

	v1 "github.com/dyrector-io/dyrectorio/agent/api/v1"

	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/k8s"

	internalconfig "github.com/dyrector-io/dyrectorio/agent/internal/config"
)

func TestResourceParsingCorrect(t *testing.T) {
	resourceConfig := v1.ResourceConfig{
		Limits: v1.Resources{
			CPU:    "1m",
			Memory: "2m",
		},
		Requests: v1.Resources{
			CPU:    "3m",
			Memory: "4m",
		},
	}

	resources, err := k8s.GetResourceManagementForTest(resourceConfig, nil)

	assert.Nil(t, err)
	assert.Equal(t, resources.Limits.Cpu().String(), "1m")
	assert.Equal(t, resources.Limits.Memory().String(), "2m")
	assert.Equal(t, resources.Requests.Cpu().String(), "3m")
	assert.Equal(t, resources.Requests.Memory().String(), "4m")
}

func TestResourceParsingLimitsCPUError(t *testing.T) {
	resourceConfig := v1.ResourceConfig{
		Limits: v1.Resources{
			CPU:    "ERROR",
			Memory: "2m",
		},
		Requests: v1.Resources{
			CPU:    "3m",
			Memory: "4m",
		},
	}

	_, err := k8s.GetResourceManagementForTest(resourceConfig, nil)

	assert.ErrorIs(t, err, k8s.NewResourceError(k8s.FieldCPU, k8s.GroupLimits, false))
}

func TestResourceParsingLimitsMemoryError(t *testing.T) {
	resourceConfig := v1.ResourceConfig{
		Limits: v1.Resources{
			CPU:    "1m",
			Memory: "ERROR",
		},
		Requests: v1.Resources{
			CPU:    "3m",
			Memory: "4m",
		},
	}

	_, err := k8s.GetResourceManagementForTest(resourceConfig, nil)

	assert.ErrorIs(t, err, k8s.NewResourceError(k8s.FieldMemory, k8s.GroupLimits, false))
}

func TestResourceParsingRequestsCPUError(t *testing.T) {
	resourceConfig := v1.ResourceConfig{
		Limits: v1.Resources{
			CPU:    "1m",
			Memory: "2m",
		},
		Requests: v1.Resources{
			CPU:    "ERROR",
			Memory: "4m",
		},
	}

	_, err := k8s.GetResourceManagementForTest(resourceConfig, nil)

	assert.ErrorIs(t, err, k8s.NewResourceError(k8s.FieldCPU, k8s.GroupRequests, false))
}

func TestResourceParsingRequestsMemoryError(t *testing.T) {
	resourceConfig := v1.ResourceConfig{
		Limits: v1.Resources{
			CPU:    "1m",
			Memory: "2m",
		},
		Requests: v1.Resources{
			CPU:    "3m",
			Memory: "ERROR",
		},
	}

	_, err := k8s.GetResourceManagementForTest(resourceConfig, nil)

	assert.ErrorIs(t, err, k8s.NewResourceError(k8s.FieldMemory, k8s.GroupRequests, false))
}

func TestResourceParsingFallback(t *testing.T) {
	resourceConfig := v1.ResourceConfig{
		Limits: v1.Resources{
			CPU:    "",
			Memory: "",
		},
		Requests: v1.Resources{
			CPU:    "",
			Memory: "",
		},
	}

	config := &config.Configuration{
		CommonConfiguration: internalconfig.CommonConfiguration{
			DefaultLimitsCPU:     "1m",
			DefaultLimitsMemory:  "2m",
			DefaultRequestsCPU:   "3m",
			DefaultRequestMemory: "4m",
		},
	}

	resources, err := k8s.GetResourceManagementForTest(resourceConfig, config)

	assert.Nil(t, err)
	assert.Equal(t, resources.Limits.Cpu().String(), "1m")
	assert.Equal(t, resources.Limits.Memory().String(), "2m")
	assert.Equal(t, resources.Requests.Cpu().String(), "3m")
	assert.Equal(t, resources.Requests.Memory().String(), "4m")
}

func TestResourceParsingFallbackOverwrite(t *testing.T) {
	resourceConfig := v1.ResourceConfig{
		Limits: v1.Resources{
			CPU:    "5m",
			Memory: "6m",
		},
		Requests: v1.Resources{
			CPU:    "7m",
			Memory: "8m",
		},
	}

	config := &config.Configuration{
		CommonConfiguration: internalconfig.CommonConfiguration{
			DefaultLimitsCPU:     "1m",
			DefaultLimitsMemory:  "2m",
			DefaultRequestsCPU:   "3m",
			DefaultRequestMemory: "4m",
		},
	}

	resources, err := k8s.GetResourceManagementForTest(resourceConfig, config)

	assert.Nil(t, err)
	assert.Equal(t, resources.Limits.Cpu().String(), "5m")
	assert.Equal(t, resources.Limits.Memory().String(), "6m")
	assert.Equal(t, resources.Requests.Cpu().String(), "7m")
	assert.Equal(t, resources.Requests.Memory().String(), "8m")
}

func TestResourceParsingFallbackLimitsCPUError(t *testing.T) {
	resourceConfig := v1.ResourceConfig{
		Limits: v1.Resources{
			CPU:    "",
			Memory: "",
		},
		Requests: v1.Resources{
			CPU:    "",
			Memory: "",
		},
	}

	config := &config.Configuration{
		CommonConfiguration: internalconfig.CommonConfiguration{
			DefaultLimitsCPU:     "ERROR",
			DefaultLimitsMemory:  "2m",
			DefaultRequestsCPU:   "3m",
			DefaultRequestMemory: "4m",
		},
	}

	_, err := k8s.GetResourceManagementForTest(resourceConfig, config)

	assert.ErrorIs(t, err, k8s.NewResourceError(k8s.FieldCPU, k8s.GroupLimits, true))
}

func TestResourceParsingFallbackLimitsMemoryError(t *testing.T) {
	resourceConfig := v1.ResourceConfig{
		Limits: v1.Resources{
			CPU:    "",
			Memory: "",
		},
		Requests: v1.Resources{
			CPU:    "",
			Memory: "",
		},
	}

	config := &config.Configuration{
		CommonConfiguration: internalconfig.CommonConfiguration{
			DefaultLimitsCPU:     "1m",
			DefaultLimitsMemory:  "ERROR",
			DefaultRequestsCPU:   "3m",
			DefaultRequestMemory: "4m",
		},
	}

	_, err := k8s.GetResourceManagementForTest(resourceConfig, config)

	assert.ErrorIs(t, err, k8s.NewResourceError(k8s.FieldMemory, k8s.GroupLimits, true))
}

func TestResourceParsingFallbackRequestsCPUError(t *testing.T) {
	resourceConfig := v1.ResourceConfig{
		Limits: v1.Resources{
			CPU:    "",
			Memory: "",
		},
		Requests: v1.Resources{
			CPU:    "",
			Memory: "",
		},
	}

	config := &config.Configuration{
		CommonConfiguration: internalconfig.CommonConfiguration{
			DefaultLimitsCPU:     "1m",
			DefaultLimitsMemory:  "2m",
			DefaultRequestsCPU:   "ERROR",
			DefaultRequestMemory: "4m",
		},
	}

	_, err := k8s.GetResourceManagementForTest(resourceConfig, config)

	assert.ErrorIs(t, err, k8s.NewResourceError(k8s.FieldCPU, k8s.GroupRequests, true))
}

func TestResourceParsingFallbackRequestsMemoryError(t *testing.T) {
	resourceConfig := v1.ResourceConfig{
		Limits: v1.Resources{
			CPU:    "",
			Memory: "",
		},
		Requests: v1.Resources{
			CPU:    "",
			Memory: "",
		},
	}

	config := &config.Configuration{
		CommonConfiguration: internalconfig.CommonConfiguration{
			DefaultLimitsCPU:     "1m",
			DefaultLimitsMemory:  "2m",
			DefaultRequestsCPU:   "3m",
			DefaultRequestMemory: "ERROR",
		},
	}

	_, err := k8s.GetResourceManagementForTest(resourceConfig, config)

	assert.ErrorIs(t, err, k8s.NewResourceError(k8s.FieldMemory, k8s.GroupRequests, true))
}
