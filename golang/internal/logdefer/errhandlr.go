package logdefer

import (
	"github.com/rs/zerolog"
)

func LogDeferredErr(errFunc func() error, ev *zerolog.Event, msg string) {
	err := errFunc()
	if err != nil {
		ev.Err(err).Msg(msg)
	}
}
