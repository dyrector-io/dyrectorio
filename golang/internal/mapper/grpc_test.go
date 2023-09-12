//go:build unit
// +build unit

package mapper

import (
	"testing"
	"time"

	"github.com/AlekSi/pointer"
	"github.com/docker/docker/api/types/container"
	"github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	builder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
	"github.com/stretchr/testify/assert"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
)

// crux sends both configs crane+dagent
func TestMapDeployImageRequest(t *testing.T) {
	req := testDeployRequest()
	cfg := testAppConfig()

	res := MapDeployImage(req, cfg)
	expected := testExpectedCommon(req)

	assert.Equal(t, expected, res)
}

func testExpectedCommon(req *agent.DeployRequest) *v1.DeployImageRequest {
	return &v1.DeployImageRequest{
		RequestID: "testID",
		RegistryAuth: &image.RegistryAuth{
			Name:     "test-name",
			URL:      "https://test-url.com",
			User:     "test-user",
			Password: "test-pass",
		},
		InstanceConfig: v1.InstanceConfig{
			ContainerPreName:  "test-prefix",
			MountPath:         "/path/to/mount",
			Name:              "test-prefix",
			Environment:       map[string]string{"Evn1": "Val1", "Env2": "Val2"},
			Registry:          "",
			RepositoryPreName: "repo-prefix",
			SharedEnvironment: map[string]string{},
			UseSharedEnvs:     false,
		},
		ContainerConfig: v1.ContainerConfig{
			ContainerPreName:   "test-prefix",
			Container:          "test-common-config",
			Ports:              []builder.PortBinding{{ExposedPort: 0x4d2, PortBinding: pointer.ToUint16(0x1a85)}},
			PortRanges:         []builder.PortRangeBinding{{Internal: builder.PortRange{From: 0x0, To: 0x18}, External: builder.PortRange{From: 0x40, To: 0x80}}},
			Mounts:             []string(nil),
			Volumes:            []v1.Volume{{Name: "test-vol", Path: "/Path/to/volume", Size: "512GB", Type: "666", Class: "test-storage-class"}},
			Environment:        map[string]string{"ENV1": "VAL1", "ENV2": "VAL2"},
			Secrets:            map[string]string{"secret1": "value1"},
			RuntimeConfigType:  "",
			Expose:             true,
			ExposeTLS:          true,
			IngressHost:        "test-domain",
			IngressName:        "",
			IngressPort:        12345,
			IngressUploadLimit: "5Mi",
			Shared:             false,
			ConfigContainer: &v1.ConfigContainer{
				Image:     "test-image",
				Volume:    "test-volume",
				Path:      "/path/to/vol",
				KeepFiles: true,
			},
			DockerLabels: map[string]string{"label1": "value1"},
			ImportContainer: &v1.ImportContainer{
				Volume:       "test-volume",
				Command:      "rm -rf /",
				Environments: map[string]string{"env1": "val1"},
			},
			InitContainers: []v1.InitContainer{
				{
					Name:      "test-init",
					Image:     "test-image",
					Volumes:   []v1.VolumeLink{{Name: "test-vol-link", Path: "/path/to/mount"}},
					Command:   []string{"mybin", "run"},
					Args:      []string{"--verbose"},
					UseParent: true,
					Envs:      map[string]string{"env1": "val1", "env2": "val2"},
				},
			},
			User:    req.GetCommon().User,
			Command: []string{"make", "test"},
			Args:    []string{"--name", "test-arg"},
			TTY:     true,
			LogConfig: &container.LogConfig{
				Type:   "365",
				Config: map[string]string{"opt1": "v1", "opt2": "v2"},
			},
			RestartPolicy: "always",
			Networks:      []string{"n1", "n2"},
			NetworkMode:   "BRIDGE",
			CustomHeaders: []string(nil),
			Annotations: v1.Markers{
				Deployment: map[string]string{"annot1": "value1"},
				Service:    map[string]string{"annot2": "value2"},
				Ingress:    map[string]string{"annot3": "value3"},
			},
			DeploymentStrategy: "Recreate",
			Labels: v1.Markers{
				Deployment: map[string]string{"label1": "value1"},
				Service:    map[string]string{"label2": "value2"},
				Ingress:    map[string]string{"label3": "value3"},
			},
			HealthCheckConfig: v1.HealthCheckConfig{
				Port:           uint16(*req.Crane.HealthCheckConfig.Port),
				LivenessProbe:  &v1.Probe{Path: "test-liveness"},
				ReadinessProbe: &v1.Probe{Path: "test-readiness"},
				StartupProbe:   &v1.Probe{Path: "test-startup"},
			},
			ResourceConfig: v1.ResourceConfig{
				Limits:   v1.Resources{CPU: "250m", Memory: "512Mi"},
				Requests: v1.Resources{CPU: "100m", Memory: "64Mi"},
			},
			ProxyHeaders:       true,
			UseLoadBalancer:    true,
			ExtraLBAnnotations: map[string]string{"annotation1": "value1"},
		},
		RuntimeConfig: v1.Base64JSONBytes{0x6b, 0x65, 0x79, 0x31, 0x3d, 0x76, 0x61, 0x6c, 0x31, 0x2c, 0x6b, 0x65, 0x79, 0x32, 0x3d, 0x76, 0x61, 0x6c, 0x32}, // encoded string: a2V5MT12YWwxLGtleTI9dmFsMg==
		Registry:      req.Registry,
		ImageName:     "test-image",
		Tag:           "test-tag",
		Issuer:        "",
	}
}

func TestMapPorts(t *testing.T) {
	ps := []*agent.Port{
		{
			Internal: 1234,
			External: pointer.ToInt32(5678),
		},
		{
			Internal: 9999,
			External: pointer.ToInt32(1111),
		},
	}

	expected := []builder.PortBinding{
		{
			ExposedPort: 1234,
			PortBinding: pointer.ToUint16(5678),
		},
		{
			ExposedPort: 9999,
			PortBinding: pointer.ToUint16(1111),
		},
	}

	bindings := MapPorts(ps)
	assert.Equal(t, expected, bindings)
}

func TestMapSecrets(t *testing.T) {
	kvl := testKeyValueList()

	m := MapSecrets(kvl)
	expected := map[string]string{
		"testKey-1": "testID-1",
		"testKey-2": "testID-2",
	}

	assert.Equal(t, expected, m)
}

func TestMapDockerContainerEventToContainerState(t *testing.T) {
	assert.Equal(t, common.ContainerState_WAITING, MapDockerContainerEventToContainerState("create"))
	assert.Equal(t, common.ContainerState_REMOVED, MapDockerContainerEventToContainerState("destroy"))
	assert.Equal(t, common.ContainerState_WAITING, MapDockerContainerEventToContainerState("pause"))
	assert.Equal(t, common.ContainerState_RUNNING, MapDockerContainerEventToContainerState("restart"))
	assert.Equal(t, common.ContainerState_RUNNING, MapDockerContainerEventToContainerState("start"))
	assert.Equal(t, common.ContainerState_EXITED, MapDockerContainerEventToContainerState("stop"))
	assert.Equal(t, common.ContainerState_EXITED, MapDockerContainerEventToContainerState("die"))
}

func testDeployRequest() *agent.DeployRequest {
	registry := "https://my-registry.com"
	runtimeCfg := "key1=val1,key2=val2"
	var uid int64 = 777
	upLimit := "5Mi"
	mntPath := "/path/to/mount"
	repoPrefix := "repo-prefix"
	strategy := common.ExposeStrategy(777)
	b := true
	return &agent.DeployRequest{
		Id:            "testID",
		ContainerName: "test-container",
		ImageName:     "test-image",
		Tag:           "test-tag",
		Registry:      &registry,
		RuntimeConfig: &runtimeCfg,
		Dagent:        testDagentConfig(),
		Crane:         testCraneConfig(),
		Common: &agent.CommonContainerConfig{
			Name:        "test-common-config",
			Commands:    []string{"make", "test"},
			User:        &uid,
			Args:        []string{"--name", "test-arg"},
			Environment: map[string]string{"ENV1": "VAL1", "ENV2": "VAL2"},
			Secrets:     map[string]string{"secret1": "value1"},
			TTY:         &b,
			Ports: []*agent.Port{
				{
					Internal: 1234,
					External: pointer.ToInt32(6789),
				},
			},
			PortRanges: []*agent.PortRangeBinding{
				{
					Internal: &agent.PortRange{From: 0, To: 24},
					External: &agent.PortRange{From: 64, To: 128},
				},
			},
			Volumes:        []*agent.Volume{testVolume()},
			InitContainers: []*agent.InitContainer{testInitContainer()},
			Expose:         &strategy,
			Routing: &common.Routing{
				Domain:      pointer.ToString("test-domain"),
				UploadLimit: &upLimit,
				Port:        pointer.ToUint32(12345),
			},
			ConfigContainer: &common.ConfigContainer{
				Image:     "test-image",
				Volume:    "test-volume",
				Path:      "/path/to/vol",
				KeepFiles: true,
			},
			ImportContainer: &agent.ImportContainer{
				Volume:      "test-volume",
				Command:     "rm -rf /",
				Environment: map[string]string{"env1": "val1"},
			},
		},
		RegistryAuth: &agent.RegistryAuth{
			Name:     "test-name",
			User:     "test-user",
			Password: "test-pass",
			Url:      "https://test-url.com",
		},
		InstanceConfig: &agent.InstanceConfig{
			Prefix:           "test-prefix",
			MountPath:        &mntPath,
			RepositoryPrefix: &repoPrefix,
			Environment:      map[string]string{"Evn1": "Val1", "Env2": "Val2"},
		},
	}
}

func testVolume() *agent.Volume {
	size := "512GB"
	voltype := common.VolumeType(666)
	class := "test-storage-class"
	return &agent.Volume{
		Name:  "test-vol",
		Path:  "/Path/to/volume",
		Size:  &size,
		Type:  &voltype,
		Class: &class,
	}
}

func testInitContainer() *agent.InitContainer {
	b := true
	return &agent.InitContainer{
		Name:            "test-init",
		Image:           "test-image",
		Command:         []string{"mybin", "run"},
		Args:            []string{"--verbose"},
		Environment:     map[string]string{"env1": "val1", "env2": "val2"},
		UseParentConfig: &b,
		Volumes: []*agent.VolumeLink{
			{
				Name: "test-vol-link",
				Path: "/path/to/mount",
			},
		},
	}
}

func testKeyValueList() []*common.UniqueKey {
	return []*common.UniqueKey{
		{
			Id:  "testID-1",
			Key: "testKey-1",
		},
		{
			Id:  "testID-2",
			Key: "testKey-2",
		},
	}
}

func testDagentConfig() *agent.DagentContainerConfig {
	return &agent.DagentContainerConfig{
		Labels:        map[string]string{"label1": "value1"},
		RestartPolicy: common.RestartPolicy_ALWAYS.Enum(),
		LogConfig: &agent.LogConfig{
			Driver:  365,
			Options: map[string]string{"opt1": "v1", "opt2": "v2"},
		},
		NetworkMode: common.NetworkMode_BRIDGE.Enum(),
		Networks:    []string{"n1", "n2"},
	}
}

func testCraneConfig() *agent.CraneContainerConfig {
	b := true
	cpuReq := "100m"
	memReq := "64Mi"
	cpuLim := "250m"
	memLim := "512Mi"

	lProbe := "test-liveness"
	rProbe := "test-readiness"
	sProbe := "test-startup"
	port := int32(1234)
	return &agent.CraneContainerConfig{
		CustomHeaders:      []string{"header1", "value1", "header2", "value2"},
		ExtraLBAnnotations: map[string]string{"annotation1": "value1"},
		ProxyHeaders:       &b,
		UseLoadBalancer:    &b,
		Labels: &agent.Marker{
			Deployment: map[string]string{"label1": "value1"},
			Service:    map[string]string{"label2": "value2"},
			Ingress:    map[string]string{"label3": "value3"},
		},
		Annotations: &agent.Marker{
			Deployment: map[string]string{"annot1": "value1"},
			Service:    map[string]string{"annot2": "value2"},
			Ingress:    map[string]string{"annot3": "value3"},
		},
		ResourceConfig: &common.ResourceConfig{
			Requests: &common.Resource{
				Cpu:    &cpuReq,
				Memory: &memReq,
			},
			Limits: &common.Resource{
				Cpu:    &cpuLim,
				Memory: &memLim,
			},
		},
		HealthCheckConfig: &common.HealthCheckConfig{
			Port:           &port,
			LivenessProbe:  &lProbe,
			ReadinessProbe: &rProbe,
			StartupProbe:   &sProbe,
		},
		DeploymentStrategy: common.DeploymentStrategy_RECREATE.Enum(),
	}
}

func testAppConfig() *config.CommonConfiguration {
	return &config.CommonConfiguration{
		DefaultLimitsCPU:     "",
		DefaultLimitsMemory:  "",
		DefaultRequestsCPU:   "",
		DefaultRequestMemory: "",
		DefaultVolumeSize:    "",
		DefaultTag:           "",
		DefaultTimeout:       30 * time.Second,
		GrpcKeepalive:        30 * time.Second,
		Debug:                false,
		ImportContainerImage: "",
		RootDomain:           "",
		ReadHeaderTimeout:    30 * time.Second,
		DefaultRegistry:      "",
		SecretPrivateKey:     "",
		JwtToken: &config.ValidJWT{
			Issuer:           "test-issuer",
			Subject:          "test-subject",
			StringifiedToken: "test-token",
			IssuedAt:         time.Now(),
		},
	}
}

func testDeployRequestWithLogDriver(driverType common.DriverType) *agent.DeployRequest {
	request := testDeployRequest()
	if driverType == common.DriverType_NODE_DEFAULT {
		request.Dagent.LogConfig = nil
	} else {
		request.Dagent.LogConfig.Driver = driverType
	}
	return request
}

func testExpectedCommonWithLogConfigType(req *agent.DeployRequest, logConfigType string) *v1.DeployImageRequest {
	expected := testExpectedCommon(req)
	if req.Dagent.LogConfig == nil {
		expected.ContainerConfig.LogConfig = nil
	} else {
		expected.ContainerConfig.LogConfig.Type = logConfigType
	}
	return expected
}

func TestMapDeployImageLogConfig(t *testing.T) {
	testCases := []struct {
		desc   string
		driver common.DriverType
		want   string
	}{
		{
			desc:   "Node default driver type",
			driver: common.DriverType_NODE_DEFAULT,
		},
		{
			desc:   "None driver type",
			driver: common.DriverType_DRIVER_TYPE_NONE,
			want:   "none",
		},
		{
			desc:   "Gcplogs driver type",
			driver: common.DriverType_GCPLOGS,
			want:   "gcplogs",
		},
		{
			desc:   "Local driver type",
			driver: common.DriverType_LOCAL,
			want:   "local",
		},
		{
			desc:   "Json-file driver type",
			driver: common.DriverType_JSON_FILE,
			want:   "json-file",
		},
		{
			desc:   "Syslog driver type",
			driver: common.DriverType_SYSLOG,
			want:   "syslog",
		},
		{
			desc:   "Journald driver type",
			driver: common.DriverType_JOURNALD,
			want:   "journald",
		},
		{
			desc:   "Gelf driver type",
			driver: common.DriverType_GELF,
			want:   "gelf",
		},
		{
			desc:   "Fluentd driver type",
			driver: common.DriverType_FLUENTD,
			want:   "fluentd",
		},
		{
			desc:   "Awslogs driver type",
			driver: common.DriverType_AWSLOGS,
			want:   "awslogs",
		},
		{
			desc:   "Splunk driver type",
			driver: common.DriverType_SPLUNK,
			want:   "splunk",
		},
		{
			desc:   "Etwlogs driver type",
			driver: common.DriverType_ETWLOGS,
			want:   "etwlogs",
		},
		{
			desc:   "Logentries driver type",
			driver: common.DriverType_LOGENTRIES,
			want:   "logentries",
		},
	}

	for _, tC := range testCases {
		t.Run(tC.desc, func(t *testing.T) {
			req := testDeployRequestWithLogDriver(tC.driver)
			cfg := testAppConfig()

			res := MapDeployImage(req, cfg)
			expected := testExpectedCommonWithLogConfigType(req, tC.want)

			assert.Equal(t, expected, res)
		})
	}
}

func TestCraneDeploymentStrategyMapping(t *testing.T) {
	craneConfig := testCraneConfig()
	testCases := []struct {
		strat *common.DeploymentStrategy
		exp   string
		desc  string
	}{
		{
			desc:  "expected Recreate",
			exp:   "Recreate",
			strat: common.DeploymentStrategy_RECREATE.Enum(),
		},
		{
			desc:  "expected RollingUpdate",
			exp:   "RollingUpdate",
			strat: common.DeploymentStrategy_ROLLING_UPDATE.Enum(),
		},
	}
	for _, tC := range testCases {
		t.Run(tC.desc, func(t *testing.T) {
			craneConfig.DeploymentStrategy = tC.strat
			resultConfig := v1.ContainerConfig{}
			mapCraneConfig(craneConfig, &resultConfig)
			assert.Equalf(t, tC.exp, resultConfig.DeploymentStrategy, "%s got: %s", tC.desc, resultConfig.DeploymentStrategy)
		})
	}
}
