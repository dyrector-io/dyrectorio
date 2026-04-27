//go:build unit
// +build unit

package bwcli

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/rs/zerolog"
)

type runCall struct {
	cmd  string
	args []string
	env  map[string]string
	in   []byte
}

type fakeRunner struct {
	mu    sync.Mutex
	calls []runCall

	// Scripted responses in order.
	steps []fakeStep
	i     int
}

type fakeStep struct {
	wantCmd  string
	wantArgs []string
	// optional env assertions:
	wantEnvKeys map[string]string // exact match for keys provided here
	stdout      []byte
	stderr      []byte
	exitCode    int
	err         error
}

func (f *fakeRunner) Run(ctx context.Context, cmd string, args []string, env map[string]string, stdin []byte) RunResult {
	f.mu.Lock()
	defer f.mu.Unlock()

	f.calls = append(f.calls, runCall{
		cmd:  cmd,
		args: append([]string(nil), args...),
		env:  cloneMap(env),
		in:   append([]byte(nil), stdin...),
	})

	// Allow ctx simulation if step provides ctx-like error.
	if f.i >= len(f.steps) {
		return RunResult{StdErr: []byte("unexpected call"), ExitCode: 2, Err: errors.New("unexpected call")}
	}
	step := f.steps[f.i]
	f.i++

	if step.wantCmd != "" && step.wantCmd != cmd {
		return RunResult{StdErr: []byte("cmd mismatch"), ExitCode: 2, Err: errors.New("cmd mismatch")}
	}
	if step.wantArgs != nil && strings.Join(step.wantArgs, "|") != strings.Join(args, "|") {
		return RunResult{StdErr: []byte("args mismatch"), ExitCode: 2, Err: errors.New("args mismatch")}
	}
	for k, v := range step.wantEnvKeys {
		if env[k] != v {
			return RunResult{StdErr: []byte("env mismatch: " + k), ExitCode: 2, Err: errors.New("env mismatch")}
		}
	}

	return RunResult{Stdout: step.stdout, StdErr: step.stderr, ExitCode: step.exitCode, Err: step.err}
}

// newTestClient creates a BWClient with a fake runner and the given logger,
// using empty HostURL/ClientID (fine for unit tests that don't hit the disk path logic).
func newTestClient(fr *fakeRunner, logger *zerolog.Logger) *BWClient {
	return New(context.Background(), &Config{BWPath: "bw"}, fr, logger)
}

func TestStatus_ParsesJSON(t *testing.T) {
	fr := &fakeRunner{
		steps: []fakeStep{
			{
				wantCmd:  "bw",
				wantArgs: []string{"status"},
				stdout:   []byte(`{"serverUrl":"https://vault.example","status":"unlocked","userEmail":"a@b.com"}`),
				exitCode: 0,
			},
		},
	}

	var buf bytes.Buffer
	logger := zerolog.New(&buf).Level(zerolog.DebugLevel)

	c := newTestClient(fr, &logger)
	defer c.Cleanup()

	st, err := c.Status()
	if err != nil {
		t.Fatalf("expected nil err, got %v", err)
	}
	if st.Status != "unlocked" || st.UserEmail != "a@b.com" {
		t.Fatalf("unexpected status parsed: %+v", st)
	}
	// Ensure no payload dumped into logs.
	if strings.Contains(buf.String(), "vault.example") {
		t.Fatalf("log should not contain full JSON payload")
	}
}

func TestListItems_SetsSessionEnv(t *testing.T) {
	fr := &fakeRunner{
		steps: []fakeStep{
			{
				wantCmd:  "bw",
				wantArgs: []string{"list", "items"},
				wantEnvKeys: map[string]string{
					"BW_SESSION": "SESSION123",
				},
				stdout:   []byte(`[{ "id":"1","name":"X" }, { "id":"2","name":"Y" }]`),
				exitCode: 0,
			},
		},
	}

	noopLogger := zerolog.Nop()
	c := newTestClient(fr, &noopLogger)
	defer c.Cleanup()

	items, err := c.ListItems("SESSION123")
	if err != nil {
		t.Fatalf("expected nil err, got %v", err)
	}
	if len(items) != 2 || items[0].ID != "1" || items[1].Name != "Y" {
		t.Fatalf("unexpected items: %+v", items)
	}
}

func TestErrorMapping(t *testing.T) {
	tests := []struct {
		name   string
		stderr string
		stdout string
		want   error
	}{
		{"unauthorized", "You are not logged in.", "", ErrUnauthorized},
		{"locked", "Vault is locked.", "", ErrLocked},
		{"notfound", "Not found.", "", ErrNotFound},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fr := &fakeRunner{
				steps: []fakeStep{
					{
						wantCmd:  "bw",
						wantArgs: []string{"list", "items"},
						stderr:   []byte(tt.stderr),
						stdout:   []byte(tt.stdout),
						exitCode: 1,
						err:      errors.New("exit status 1"),
					},
				},
			}
			noopLogger := zerolog.Nop()
			c := newTestClient(fr, &noopLogger)
			defer c.Cleanup()

			_, err := c.ListItems("S")
			if !errors.Is(err, tt.want) {
				t.Fatalf("expected errors.Is(%v), got %v", tt.want, err)
			}
		})
	}
}

func TestTimeoutMapping(t *testing.T) {
	fr := &fakeRunner{
		steps: []fakeStep{
			{
				wantCmd:  "bw",
				wantArgs: []string{"status"},
				exitCode: -1,
				err:      context.DeadlineExceeded,
			},
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Nanosecond)
	defer cancel()

	noopLogger := zerolog.Nop()
	c := New(ctx, &Config{BWPath: "bw"}, fr, &noopLogger)
	defer c.Cleanup()

	_, err := c.Status()
	if !errors.Is(err, ErrTimeout) {
		t.Fatalf("expected ErrTimeout, got %v", err)
	}
}

func TestLogsDoNotLeakSecrets(t *testing.T) {
	fr := &fakeRunner{
		steps: []fakeStep{
			{
				wantCmd:  "bw",
				wantArgs: []string{"unlock", "--raw"},
				stdout:   []byte("SESSION_TOKEN_VALUE\n"),
				exitCode: 0,
			},
		},
	}
	var buf bytes.Buffer
	logger := zerolog.New(&buf).Level(zerolog.DebugLevel)

	c := newTestClient(fr, &logger)
	defer c.Cleanup()

	session, err := c.Unlock("MASTER_PASSWORD_123")
	if err != nil {
		t.Fatalf("unexpected err: %v", err)
	}
	if session != "SESSION_TOKEN_VALUE" {
		t.Fatalf("unexpected session: %q", session)
	}

	logs := buf.String()
	if strings.Contains(logs, "MASTER_PASSWORD_123") {
		t.Fatalf("logs must not contain master password")
	}
	if strings.Contains(logs, "SESSION_TOKEN_VALUE") {
		t.Fatalf("logs must not contain session token")
	}
}

func TestIntegrationLikeFlow_StatusUnlockSyncList(t *testing.T) {
	// Simulate a common agent flow.
	itemsJSON, _ := json.Marshal([]map[string]any{
		{"id": "1", "name": "A"},
		{"id": "2", "name": "B"},
	})

	fr := &fakeRunner{
		steps: []fakeStep{
			{
				wantCmd:  "bw",
				wantArgs: []string{"status"},
				stdout:   []byte(`{"status":"locked"}`),
				exitCode: 0,
			},
			{
				wantCmd:  "bw",
				wantArgs: []string{"unlock", "--raw"},
				stdout:   []byte("S\n"),
				exitCode: 0,
			},
			{
				wantCmd:  "bw",
				wantArgs: []string{"sync"},
				wantEnvKeys: map[string]string{
					"BW_SESSION": "S",
				},
				exitCode: 0,
			},
			{
				wantCmd:  "bw",
				wantArgs: []string{"list", "items"},
				wantEnvKeys: map[string]string{
					"BW_SESSION": "S",
				},
				stdout:   itemsJSON,
				exitCode: 0,
			},
		},
	}

	noopLogger := zerolog.Nop()
	c := newTestClient(fr, &noopLogger)
	defer c.Cleanup()

	st, err := c.Status()
	if err != nil {
		t.Fatalf("status err: %v", err)
	}
	if st.Status != "locked" {
		t.Fatalf("unexpected status: %+v", st)
	}

	session, err := c.Unlock("pw")
	if err != nil {
		t.Fatalf("unlock err: %v", err)
	}

	if err := c.Sync(session); err != nil {
		t.Fatalf("sync err: %v", err)
	}

	items, err := c.ListItems(session)
	if err != nil {
		t.Fatalf("list err: %v", err)
	}
	if len(items) != 2 || items[0].Name != "A" {
		t.Fatalf("unexpected items: %+v", items)
	}
}
