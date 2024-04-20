package config

import (
	"time"

	"github.com/dyrector-io/dyrectorio/golang/internal/config"
)

// Crane(kubernetes)-specific configuration options
type Configuration struct {
	FieldManagerName string `yaml:"fieldManagerName"      env:"FIELD_MANAGER_NAME"        env-default:"crane-dyrector-io"`
	KeyIssuer        string `yaml:"keyIssuer"             env:"KEY_ISSUER"                env-default:"co.dyrector.io/issuer"`
	KubeConfig       string `yaml:"kubeConfig"            env:"KUBECONFIG"                env-default:""`
	OwnDeployment    string `yaml:"ownDeployment"         env:"CRANE_DEPLOYMENT_NAME"`
	OwnNamespace     string `yaml:"ownNamespace"           env:"CRANE_DEPLOYMENT_NAMESPACE"`
	SecretName       string `yaml:"secretName"  env:"SECRET_NAME"         env-default:"dyrectorio-secret"`
	Namespace        string `yaml:"namespace"   env:"SECRET_NAMESPACE"    env-default:"dyrectorio"`
	config.CommonConfiguration
	DefaultKubeTimeout  time.Duration `yaml:"defaultKubeTimeout"    env:"DEFAULT_KUBE_TIMEOUT"      env-default:"2m"`
	TestTimeoutDuration time.Duration `yaml:"testTimeout"           env:"TEST_TIMEOUT"              env-default:"15s"`
	CraneInCluster      bool          `yaml:"craneInCluster"        env:"CRANE_IN_CLUSTER"          env-default:"false"`
	ForceOnConflicts    bool          `yaml:"forceOnConflicts"      env:"FORCE_ON_CONFLICTS"        env-default:"true"`
}
