package bwcli

import "errors"

var (
	ErrUnauthorized          = errors.New("bwcli: unauthorized")
	ErrLocked                = errors.New("bwcli: vault locked")
	ErrNotFound              = errors.New("bwcli: not found")
	ErrMultipleResults       = errors.New("bwcli: multiple results")
	ErrCLI                   = errors.New("bwcli: generic error")
	ErrDecode                = errors.New("bwcli: decode error")
	ErrTimeout               = errors.New("bwcli: timeout")
	ErrServerVersionMismatch = errors.New(
		"bwcli: server does not support this CLI version " +
			"(userDecryptionOptions missing); upgrade the server or downgrade the bw CLI")
)
