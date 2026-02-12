//go:build unit
// +build unit

package util_test

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/golang/internal/util"
)

func TestJoinV(t *testing.T) {
	assert.Equal(t, "", util.JoinV(""))
	assert.Equal(t, "o:o", util.JoinV(":", "o", "o"))
	assert.Equal(t, "i", util.JoinV("\\", "i"))
	assert.Equal(t, "i/i/i", util.JoinV("/", "i", "i", "i"))
	assert.Equal(t, "ENVKEY", util.JoinV("=", "ENVKEY", "")) // this is intentionally a bad example
}

func TestJoinVEmpty(t *testing.T) {
	assert.Equal(t, "ENVKEY=", util.JoinVEmpty("=", "ENVKEY", "")) // this is intentionally a bad example
}

func TestFallback(t *testing.T) {
	assert.Equal(t, "", util.Fallback(""))
	assert.Equal(t, "1", util.Fallback("1", "2", "3"))
	assert.Equal(t, "2", util.Fallback("", "2"))
	assert.Equal(t, "4", util.Fallback("", "", "", "4"))
}

func TestParseCPUToMilli(t *testing.T) {
	t.Parallel()

	tests := []struct {
		in       string
		expected int64
		wantErr  bool
	}{
		{"500m", 500, false},
		{"1", 1000, false},
		{"2.5", 2500, false},
		{"0", 0, false},
		{"250m", 250, false},
		{"abc", 0, true},
		{" ", 0, false},
		{"", 0, false},
	}

	for _, tc := range tests {
		t.Run(tc.in, func(t *testing.T) {
			t.Parallel()
			got, err := util.ParseCPUToMilli(tc.in)
			if tc.wantErr {
				assert.Error(t, err, "expected error for %q", tc.in)
				return
			}
			assert.NoError(t, err, "unexpected error for %q", tc.in)
			assert.EqualValues(t, tc.expected, got, "millicores mismatch for %q", tc.in)
		})
	}
}

func TestMilliToNanoCPUs(t *testing.T) {
	t.Parallel()

	tests := []struct {
		milli    int64
		expected int64
	}{
		{0, 0},
		// go ignores _ in ints, it's for us to see it better
		{1, 1_000_000},            // 1 mCPU -> 1e6 NanoCPUs
		{500, 500_000_000},        // 0.5 CPU
		{1000, 1_000_000_000},     // 1 CPU
		{2500, 2_500_000_000},     // 2.5 CPU
		{100000, 100_000_000_000}, // 100 CPU (big but valid int64)
	}

	for _, tc := range tests {
		t.Run(fmt.Sprintf("%dm", tc.milli), func(t *testing.T) {
			t.Parallel()
			got := util.MilliToNanoCPUs(tc.milli)
			assert.EqualValues(t, tc.expected, got, "NanoCPUs mismatch for %d mCPU", tc.milli)
		})
	}
}

func TestParseBytes(t *testing.T) {
	t.Parallel()

	tests := []struct {
		in       string
		expected int64
		wantErr  bool
	}{
		{"0", 0, false},
		{"256Mi", 256 * 1024 * 1024, false},    // 268,435,456
		{"1Gi", 1 * 1024 * 1024 * 1024, false}, // 1,073,741,824
		{"500M", 500 * 1_000_000, false},       // decimal MB
		{"2Gi", 2 * 1024 * 1024 * 1024, false}, // 2,147,483,648
		{"turtles", 0, true},
		{" ", 0, false},
		{"", 0, false},
	}

	for _, tc := range tests {
		t.Run(tc.in, func(t *testing.T) {
			t.Parallel()
			got, err := util.ParseBytes(tc.in)
			if tc.wantErr {
				assert.Error(t, err, "expected error for %q", tc.in)
				return
			}
			assert.NoError(t, err, "unexpected error for %q", tc.in)
			assert.EqualValues(t, tc.expected, got, "bytes mismatch for %q", tc.in)
		})
	}
}

func TestIntegration_CPUParseThenNanoCPUs(t *testing.T) {
	t.Parallel()

	type tc struct {
		in       string
		expected int64
	}
	cases := []tc{
		{"1", 1_000_000_000},
		{"500m", 500_000_000},
		{"2.5", 2_500_000_000},
	}

	for _, c := range cases {
		t.Run(c.in, func(t *testing.T) {
			t.Parallel()
			milli, err := util.ParseCPUToMilli(c.in)
			assert.NoError(t, err)
			got := util.MilliToNanoCPUs(milli)
			assert.EqualValues(t, c.expected, got)
		})
	}
}
