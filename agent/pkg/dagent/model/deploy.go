package model

import (
	_ "github.com/go-playground/validator/v10"
)

type TraefikDeployRequest struct {
	// LogLevel defaults to INFO
	LogLevel string `json:"logLevel"`
	// if services exposed with certs, default: false
	TLS bool `json:"TLS"`
	// the email address for expiry notifications, sent by acme
	AcmeMail string `json:"acmeMail" binding:"required_if=TLS true"`
}
