package util

import (
	"fmt"
	"strings"
	"time"

	"k8s.io/apimachinery/pkg/api/resource"
)

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

// parseCPUToMilli parses a Kubernetes-style CPU quantity string
func ParseCPUToMilli(qty string) (int64, error) {
	qty = strings.TrimSpace(qty)
	if qty == "" {
		return 0, nil
	}

	q, err := resource.ParseQuantity(qty)
	if err != nil {
		return 0, fmt.Errorf("invalid CPU quantity %q: %w", qty, err)
	}
	return q.MilliValue(), nil
}

// milliToNanoCPUs converts millicores to Docker NanoCPUs.
func MilliToNanoCPUs(milli int64) int64 {
	return milli * int64(time.Millisecond)
}

// parseBytes parses a Kubernetes-style memory quantity string
func ParseBytes(qty string) (int64, error) {
	qty = strings.TrimSpace(qty)
	if qty == "" {
		return 0, nil
	}

	q, err := resource.ParseQuantity(qty)
	if err != nil {
		return 0, fmt.Errorf("invalid memory quantity %q: %w", qty, err)
	}
	return q.Value(), nil
}
