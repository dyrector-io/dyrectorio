package label

import "github.com/dyrector-io/dyrectorio/golang/internal/util"

const (
	DyrectorioOrg   = "org.dyrectorio."
	SecretKeys      = "secret.keys"
	ContainerPrefix = "container.prefix"
	ServiceCategory = "service-category"
)

func GetPrefixLabelFilter(prefix string) string {
	return util.JoinV("=", DyrectorioOrg+ContainerPrefix, prefix)
}

func GetHiddenServiceCategory(category string) string {
	return "_" + category
}
