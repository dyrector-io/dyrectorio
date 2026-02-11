package bwcli

import "errors"

var (
	ErrUnauthorized = errors.New("bwcli: unauthorized")
	ErrLocked       = errors.New("bwcli: vault locked")
	ErrNotFound     = errors.New("bwcli: not found")
	ErrCLI          = errors.New("bwcli: cli error")
	ErrDecode       = errors.New("bwcli: decode error")
	ErrTimeout      = errors.New("bwcli: timeout")
)
