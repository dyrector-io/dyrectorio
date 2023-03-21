package label

import "github.com/dyrector-io/dyrectorio/golang/internal/util"

const (
	DyrectorioOrg   = "org.dyrectorio."
	SecretKeys      = "secret.keys"
	ContainerPrefix = "container.prefix"
)

func GetPrefixLabelFilter(prefix string) string {
	return util.JoinV("=", DyrectorioOrg+ContainerPrefix, prefix)
}
