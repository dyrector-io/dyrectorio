package backoff_test

import (
	"context"
	"testing"
	"time"

	"github.com/dyrector-io/dyrectorio/golang/internal/backoff"

	"github.com/rs/zerolog/log"
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
		t.Run(tt.name, func(_ *testing.T) {
			b := backoff.New(tt.params.maxWait)
			for i := range 30 {
				start := time.Now()
				b.Wait(context.Background())
				end := time.Now()
				log.Printf("iter %d passed: %s\n", i, end.Sub(start))
			}
		})
	}
}

func TestBackoffCancel(_ *testing.T) {
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
	log.Printf("context canceled after :%v\n", end.Sub(start))
}
