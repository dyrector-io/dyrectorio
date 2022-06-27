package util

import "strings"

func JoinV(separator string, items ...string) string {
	return strings.Join(items, separator)
}

// variadic string fallback, accepting string params
// returns the first non-empty value
func Fallback(str ...string) string {
	for i := range str {
		if len(str[i]) > 0 {
			return str[i]
		}
	}
	return ""
}
