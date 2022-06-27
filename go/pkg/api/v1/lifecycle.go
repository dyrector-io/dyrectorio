package v1

type ContainerStatusResponse struct {
	Repository string `json:"repository" binding:"required"`
	Tag        string `json:"tag" binding:"required"`
	State      string `json:"state" binding:"required"`
	Status     string `json:"status" binding:"required"`
}

type DeploymentQuery struct {
	ContainerPreName string `uri:"preName" binding:"required"`
	ContainerName    string `uri:"name"  binding:"required"`
}

type DeleteDeploymentQuery struct {
	ContainerPreName string `uri:"preName"  binding:"required"`
	ContainerName    string `uri:"name" binding:"required"`
}

type DeleteDeploymentResponse struct {
	Error string
}
