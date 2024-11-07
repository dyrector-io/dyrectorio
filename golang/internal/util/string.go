package util

import "strings"

// JoinV is a variadic alternative for strings.Join
// it removes empty values in addition
func JoinV(separator string, items ...string) string {
	clean := []string{}
	for _, item := range items {
		if item != "" {
			clean = append(clean, item)
		}
	}
	return strings.Join(clean, separator)
}

// JoinV is a variadic alternative for strings.Join
// it keeps empty values
func JoinVEmpty(separator string, items ...string) string {
	return strings.Join(append([]string{}, items...), separator)
}

// variadic string fallback, accepting string params
// returns the first non-empty value or empty if there is none
func Fallback(str ...string) string {
	for i := range str {
		if str[i] != "" {
			return str[i]
		}
	}
	return ""
}
