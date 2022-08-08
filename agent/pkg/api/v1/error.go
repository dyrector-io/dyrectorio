package v1

const (
	NotFound               = "NOT_FOUND"
	MissingParameter       = "MISSING_PARAMETER"
	MultipleContainerFound = "MULTIPLE_CONTAINER_FOUND"
	ContainerError         = "CONTAINER_ERROR"
	UpdateError            = "UPDATE_ERROR"
	DeployError            = "DEPLOY_ERROR"
	ValidationError        = "VALIDATION_ERROR"
)

type Error struct {
	Error       string `json:"error"`
	Value       string `json:"value"`
	Description string `json:"description"`
}

type ErrorResponse struct {
	Errors []Error `json:"errors"`
}

// error creator response with a single error
func NewErrorResponse(err, val, desc string) ErrorResponse {
	return ErrorResponse{[]Error{{
		Error:       err,
		Value:       val,
		Description: desc,
	},
	}}
}
