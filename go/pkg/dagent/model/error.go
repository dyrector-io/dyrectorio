package model

const (
	NotFound               = "NOT_FOUND"
	MissingParameter       = "MISSING_PARAMETER"
	MultipleContainerFound = "MULTIPLE_CONTAINER_FOUND"
	ContainerError         = "CONTAINER_ERROR"
	UpdateError            = "UPDATE_ERROR"
)

type Error struct {
	Error       string `json:"error"`
	Value       string `json:"value"`
	Description string `json:"description"`
}

type ErrorResponse struct {
	Errors []Error `json:"errors"`
}
