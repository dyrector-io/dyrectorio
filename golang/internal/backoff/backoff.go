/*
Naive implementation of a pluggable backoff tracker
cooldown: resets after 5 minute of not receiving any requests to wait
backoff increase: tn​ = t0 ​+ k*square(n)
*/
package backoff

import (
	"context"
	"time"

	"github.com/rs/zerolog/log"
)

const (
	// the first wait
	minWaitMillis = 20
	// a constant for the scaling out
	scaleFactor = 32
	// a timeout for resets
	cooldownThresholdMinute = 5
)

type IncrementalBackoff interface {
	Wait(context.Context)
}

type backoff struct {
	lastSeen time.Time
	counter  uint32
	maxWait  time.Duration
}

// safeIncrement is used to keep counter down, so it wont icrease after max wait is reached
func (b *backoff) safeIncrement() time.Duration {
	wait := (minWaitMillis + time.Duration(scaleFactor*(b.counter+1*b.counter+1))) * time.Millisecond
	if wait < b.maxWait {
		b.counter++
		log.Trace().Msgf("new wait time: %d", wait)
	}

	return wait
}

// reset if cooldown time threshold is reached
func (b *backoff) checkReset() {
	if time.Since(b.lastSeen) > cooldownThresholdMinute*time.Minute {
		b.counter = 0
	}
	b.lastSeen = time.Now()
}

func (b *backoff) Wait(ctx context.Context) {
	b.checkReset()

	waitDuration := b.safeIncrement()
	select {
	case <-time.After(waitDuration):
		log.Trace().Msgf("backoff waited %d", waitDuration)
	case <-ctx.Done():
		log.Debug().Msgf("context cancelled")
	}
}

// New maxWait max reachable, name is for tracing logging purposes
func New(maxWait time.Duration) IncrementalBackoff {
	return &backoff{
		maxWait: maxWait,
	}
}
