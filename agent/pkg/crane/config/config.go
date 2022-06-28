package config

import (
	"time"

	"github.com/dyrector-io/dyrectorio/agent/internal/config"
)

// Add Crane-specific configuration options
type Configuration struct {
	config.CommonConfiguration
	CraneGenTCPIngressMap string        `yaml:"craneGenTcpIngressMap" env:"CRANE_GEN_TCP_INGRESS_MAP" env-default:""`
	CraneInCluster        bool          `yaml:"craneInCluster"        env:"CRANE_IN_CLUSTER"          env-default:"false"`
	DefaultKubeTimeout    time.Duration `yaml:"defaultKubeTimeout"    env:"DEFAULT_KUBE_TIMEOUT"      env-default:"2m"`
	FieldManagerName      string        `yaml:"fieldManagerName"      env:"FIELD_MANAGER_NAME"        env-default:"crane-dyrector-io"`
	ForceOnConflicts      bool          `yaml:"forceOnConflicts"      env:"FORCE_ON_CONFLICTS"        env-default:"true"`
	KeyIssuer             string        `yaml:"keyIssuer"             env:"KEY_ISSUER"                env-default:"co.dyrector.io/issuer"`
	KubeConfig            string        `yaml:"kubeConfig"            env:"KUBECONFIG"                env-default:""`
	TestTimeoutDuration   time.Duration `yaml:"testTimeout"           env:"TEST_TIMEOUT"              env-default:"15s"`
}

// Cfg is the global configuration for crane
var Cfg Configuration
