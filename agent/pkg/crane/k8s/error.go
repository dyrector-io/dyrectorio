package k8s

import "fmt"

const (
	FieldCPU    = "CPU"
	FieldMemory = "Memory"

	GroupLimits   = "Limits"
	GroupRequests = "Requests"
)

type ResourceError struct {
	Field    string
	Group    string
	Fallback bool
}

func NewResourceError(errorField, errorGroup string, fallback bool) ResourceError {
	return ResourceError{
		Field:    errorField,
		Group:    errorGroup,
		Fallback: fallback,
	}
}

func (resourceError ResourceError) Error() string {
	if resourceError.Fallback {
		return fmt.Sprintf("failed to parse default '%s' in '%s'", resourceError.Field, resourceError.Group)
	}
	return fmt.Sprintf("failed to parse '%s' in '%s'", resourceError.Field, resourceError.Group)
}
