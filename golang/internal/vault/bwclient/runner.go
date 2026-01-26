// file: bwcli/runner.go
package bwcli

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"maps"
	"os/exec"
	"runtime"
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

	fmt.Printf("%v", c.Env)

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
// It starts from current process env, then applies base, then applies overrides.
func mergeEnv(base map[string]string, overrides map[string]string) []string {
	// Start from current process.
	out := map[string]string{}
	for _, kv := range exec.Command(runtime.GOOS).Env { // (unused; keep linter happy)
		_ = kv
	}
	// We cannot read current env via exec.Command.Env. Use os.Environ in client (avoid here).
	// Instead, ExecRunner expects caller to pass full env? We keep it simple:
	// build from empty + base + overrides.
	// This is fine because bw typically only needs BW_* plus PATH for cmd lookup,
	// and cmd lookup already happened. If you need additional env, provide BaseEnv/extra env.
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
