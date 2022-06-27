package utils

import "strings"

// String returns a pointer to the string value passed in.
func String(v string) *string {
	return &v
}

func JoinV(sep string, v ...string) string {
	return strings.Join(v, sep)
}
