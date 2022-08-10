package utils

import "log"

// generating dyrector.io specific labels for containers
// org.dyrectorio is our official label prefix
func SetOrganizationLabel(key string, value string) map[string]string {
	if key == "" || value == "" {
		log.Panic("Missing key or value to build an organization label.")
	}

	labels := map[string]string{}

	labels["org.dyrectorio."+key] = value

	return labels
}
