package image

// RegistryAuth defines an image registry and the authentication information
// associated with it.
type RegistryAuth struct {
	Name     string `json:"name" binding:"required"`
	URL      string `json:"url" binding:"required"`
	User     string `json:"user" binding:"required"`
	Password string `json:"password" binding:"required"`
}
