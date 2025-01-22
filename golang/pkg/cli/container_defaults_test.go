//go:build unit
// +build unit

package cli

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRenderTraefikHostRules(t *testing.T) {
	type args struct {
		hosts []string
	}
	tests := []struct {
		name string
		want string
		desc string
		args args
	}{
		{
			name: "one-host",
			args: args{
				hosts: []string{"localhost:8000"},
			},
			want: "Host(`localhost:8000`)",
		},
		{
			name: "two-hosts",
			args: args{
				hosts: []string{"localhost:8000", "test.example.com"},
			},
			want: "Host(`localhost:8000`) || Host(`test.example.com`)",
		},
		{
			name: "no-host",
			args: args{
				hosts: []string{},
			},
			want: "",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, RenderTraefikHostRules(tt.args.hosts...), tt.desc)
		})
	}

	assert.True(t, true, true)
}
