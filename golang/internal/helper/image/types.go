package image

import (
	"errors"
	"io"
)

type PullPriority int32

const (
	LocalOnly   PullPriority = 0
	PreferLocal PullPriority = 1
	ForcePull   PullPriority = 2
)

// RegistryAuth defines an image registry and the authentication information
// associated with it.
type RegistryAuth struct {
	Name     string `json:"name" binding:"required"`
	URL      string `json:"url" binding:"required"`
	User     string `json:"user" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// errors
var (
	ErrLocalImageNotFound = errors.New("image not found locally")
	ErrImageNotFound      = errors.New("image not found locally, nor remotely")
)

type CheckError struct {
	ImageID string
	Msg     string
}

func (e *CheckError) Error() string {
	return e.Msg
}

type PullDisplayFn func(header string, dockerResponse io.ReadCloser) error

type LayerProgressStatus int

// InProgressMessages status strings
var InProgressMessages = []string{
	"Already exists",
	"Pulling fs layer",
	"Waiting",
	"Downloading",
	"Download complete",
	"Verifying Checksum",
	"Extracting",
	"Pull complete",
	"Digest",
}

const (
	LayerProgressStatusMatching LayerProgressStatus = iota
	LayerProgressStatusUnknown
	LayerProgressStatusStarting
	LayerProgressStatusWaiting
	LayerProgressStatusDownloading
	LayerProgressStatusVerifying
	LayerProgressStatusDownloaded
	LayerProgressStatusExtracting
	LayerProgressStatusComplete
	LayerProgressStatusExists
)

const (
	ProgressStatusMatching    = "Image already up-to-date"
	ProgressStatusStarting    = "Pulling fs layer"
	ProgressStatusWaiting     = "Waiting"
	ProgressStatusDownloading = "Downloading"
	ProgressStatusVerifying   = "Verifying Checksum"
	ProgressStatusDownloaded  = "Download complete"
	ProgressStatusExtracting  = "Extracting"
	ProgressStatusComplete    = "Pull complete"
	ProgressStatusExists      = "Already exists"
)

func LpsFromString(status string) LayerProgressStatus {
	switch status {
	// custom phase used by us
	case ProgressStatusMatching:
		return LayerProgressStatusMatching
	case ProgressStatusStarting:
		return LayerProgressStatusStarting
	case ProgressStatusWaiting:
		return LayerProgressStatusWaiting
	case ProgressStatusDownloading:
		return LayerProgressStatusDownloading
	case ProgressStatusVerifying:
		return LayerProgressStatusVerifying
	case ProgressStatusDownloaded:
		return LayerProgressStatusDownloaded
	case ProgressStatusExtracting:
		return LayerProgressStatusExtracting
	case ProgressStatusComplete:
		return LayerProgressStatusComplete
	case ProgressStatusExists:
		return LayerProgressStatusExists
	default:
		return LayerProgressStatusUnknown
	}
}
