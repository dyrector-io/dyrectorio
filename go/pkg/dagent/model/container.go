package model

type ContainerStatusResponse struct {
	Repository string `json:"repository" binding:"required"`
	Tag        string `json:"tag" binding:"required"`
	State      string `json:"state" binding:"required"`
	Status     string `json:"status" binding:"required"`
}
