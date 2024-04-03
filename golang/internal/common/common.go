package common

import "errors"

var (
	ErrMethodNotImplemented = errors.New("method not implemented")
	ErrContainerNotFound    = errors.New("container not found")
)
