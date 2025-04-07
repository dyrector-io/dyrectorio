package backoff_test

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/dyrector-io/dyrectorio/golang/internal/backoff"
)

// TODO(nandor-magyar): rewrite this using test/synctest when we get to go 1.24
func TestBackoffWait(t *testing.T) {
	type params struct {
		maxWait time.Duration
	}
	tests := []struct {
		name   string
		params params
	}{
		{
			name: "test",
			params: params{
				maxWait: time.Second,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			b := backoff.New(tt.params.maxWait)
			for i := range 30 {
				start := time.Now()
				b.Wait(context.Background())
				end := time.Now()
				fmt.Printf("iter %d passed: %s\n", i, end.Sub(start))
			}
		})
	}
}

func TestBackoffCancel(t *testing.T) {
	b := backoff.New(time.Second)
	start := time.Now()
	ctx, cancel := context.WithCancel(context.Background())
	go func(context.Context) {
		for range 100 {
			b.Wait(ctx)
		}
	}(ctx)
	cancel()
	end := time.Now()
	fmt.Printf("context cancelled after :%v\n", end.Sub(start))
}
