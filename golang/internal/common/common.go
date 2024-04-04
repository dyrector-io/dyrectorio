package common

import "errors"

var (
	ErrUnknown              = errors.New("unknown error")
	ErrMethodNotImplemented = errors.New("method not implemented")
	ErrContainerNotFound    = errors.New("container not found")
)
