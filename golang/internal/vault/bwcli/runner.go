// file: bwcli/runner.go
package bwcli

import (
	"bytes"
	"context"
	"errors"
	"maps"
	"os/exec"
	"slices"
	"sort"
)

// Runner abstracts execution so unit tests can inject a fake.
type Runner interface {
	Run(ctx context.Context, cmd string, args []string, env map[string]string, stdin []byte) (stdout, stderr []byte, exitCode int, err error)
}

// ExecRunner is the production runner using os/exec.
type ExecRunner struct {
	// Optional working directory for bw state isolation.
	WorkDir string

	// Base environment variables to add/override (e.g. BW_DATA_PATH).
	// NOTE: Never log these values.
	BaseEnv map[string]string
}

func (r *ExecRunner) Run(ctx context.Context, cmd string, args []string, env map[string]string, stdin []byte) ([]byte, []byte, int, error) {
	c := exec.CommandContext(ctx, cmd, args...)
	if r.WorkDir != "" {
		c.Dir = r.WorkDir
	}

	mergedEnv := mergeEnv(r.BaseEnv, env)
	c.Env = slices.Clone(mergedEnv)

	var stdoutBuf, stderrBuf bytes.Buffer
	c.Stdout = &stdoutBuf
	c.Stderr = &stderrBuf
	if stdin != nil {
		c.Stdin = bytes.NewReader(stdin)
	}

	err := c.Run()

	// If context cancellation occurred, prefer ctx error.
	if ctx.Err() != nil {
		return stdoutBuf.Bytes(), stderrBuf.Bytes(), -1, ctx.Err()
	}

	exitCode := 0
	if err != nil {
		var ee *exec.ExitError
		if errors.As(err, &ee) {
			exitCode = ee.ExitCode()
		} else {
			// Failed to start or other exec-level issues.
			return stdoutBuf.Bytes(), stderrBuf.Bytes(), -1, err
		}
	}

	return stdoutBuf.Bytes(), stderrBuf.Bytes(), exitCode, err
}

// mergeEnv returns an environment suitable for exec.Cmd.Env.
// Builds env from base + overrides (does not inherit process env).
// This is fine because bw typically only needs BW_* variables.
// If additional env vars are needed, provide them via BaseEnv.
func mergeEnv(base, overrides map[string]string) []string {
	out := map[string]string{}
	maps.Copy(out, base)
	maps.Copy(out, overrides)

	keys := make([]string, 0, len(out))
	for k := range out {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	env := make([]string, 0, len(keys))
	for _, k := range keys {
		env = append(env, k+"="+out[k])
	}
	return env
}
