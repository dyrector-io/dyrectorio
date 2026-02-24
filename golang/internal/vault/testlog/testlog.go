package testlog

import (
	"fmt"
	"io"
	"regexp"
	"time"

	"github.com/rs/zerolog"
)

var (
	reJWTLike = regexp.MustCompile(`\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b`)
	reLongTok = regexp.MustCompile(`\b[A-Za-z0-9+/=_-]{24,}\b`)
)

func NewPrettyLogger(w io.Writer, level zerolog.Level) zerolog.Logger {
	cw := zerolog.ConsoleWriter{
		Out:        w,
		TimeFormat: time.RFC3339,
		NoColor:    true, // deterministic for tests
		PartsOrder: []string{
			zerolog.TimestampFieldName,
			zerolog.LevelFieldName,
			"op",
			"exit_code",
			"duration",
			zerolog.MessageFieldName,
		},
		FormatMessage: func(i any) string {
			if i == nil {
				return ""
			}
			return redact(fmt.Sprint(i))
		},
		FormatFieldValue: func(i any) string {
			if i == nil {
				return ""
			}
			return redact(fmt.Sprint(i))
		},
	}

	return zerolog.New(cw).
		Level(level).
		With().
		Timestamp().
		Logger()
}

func redact(s string) string {
	if s == "" {
		return s
	}

	s = reJWTLike.ReplaceAllString(s, "[REDACTED_JWT]")
	s = reLongTok.ReplaceAllStringFunc(s, func(m string) string {
		// Avoid nuking small numeric fields like exit codes.
		if len(m) < 24 || isDigits(m) {
			return m
		}
		return "[REDACTED]"
	})

	s = redactKV(s, "BW_SESSION")
	s = redactKV(s, "BW_CLIENTSECRET")
	s = redactKV(s, "BW_CLIENTID")
	s = redactKV(s, "MASTER_PASSWORD")

	return s
}

func redactKV(s, key string) string {
	re := regexp.MustCompile(`(?i)\b` + regexp.QuoteMeta(key) + `\b\s*[:=]\s*([^\s,;]+)`)
	return re.ReplaceAllString(s, key+"=[REDACTED]")
}

func isDigits(s string) bool {
	for _, r := range s {
		if r < '0' || r > '9' {
			return false
		}
	}
	return true
}
