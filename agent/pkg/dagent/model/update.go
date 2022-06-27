package model

type UpdateWebhook struct {
	Token *string `json:"token" binding:"required"`
}
