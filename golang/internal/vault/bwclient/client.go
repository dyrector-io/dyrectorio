// file: bwcli/client.go
package bwcli

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"maps"
	"strings"
	"time"

	"github.com/rs/zerolog"
)

// Usage example:
//
//	logger := zerolog.New(os.Stdout).With().Timestamp().Logger()
//	c := bwcli.New(bwcli.Config{Logger: logger})
//
//	st, err := c.Status(ctx)
//	if err != nil { ... }
//
//	session, err := c.Unlock(ctx, "master-password") // session string
//	if err != nil { ... }
//
//	if err := c.Sync(ctx, session); err != nil { ... }
//
//	items, err := c.ListItems(ctx, session)
//	_ = items

type Config struct {
	BWPath string // default "bw"

	Logger zerolog.Logger
	Runner Runner

	// Optional working directory for bw state.
	WorkDir string

	// Optional env to pass on every command (e.g. BW_DATA_PATH).
	// Values must never be logged.
	ExtraEnv map[string]string

	// HostURL
	HostURL string
}

type Client struct {
	bwPath   string
	log      zerolog.Logger
	runner   Runner
	workDir  string
	extraEnv map[string]string
}

func New(cfg Config) *Client {
	bw := cfg.BWPath
	if bw == "" {
		bw = "bw"
	}

	l := cfg.Logger
	// If zero logger, create a disabled one.
	if l.GetLevel() == zerolog.NoLevel {
		l = zerolog.Nop()
	}

	var r Runner = cfg.Runner
	if r == nil {
		r = &ExecRunner{
			WorkDir: cfg.WorkDir,
			BaseEnv: cfg.ExtraEnv,
		}
	}

	return &Client{
		bwPath:   bw,
		log:      l,
		runner:   r,
		workDir:  cfg.WorkDir,
		extraEnv: cloneMap(cfg.ExtraEnv),
	}
}

func (c *Client) Status(ctx context.Context) (Status, error) {
	stdout, _, _, err := c.run(ctx, "", []string{"status"}, nil)
	if err != nil {
		return Status{}, err
	}
	var st Status
	if err := decodeJSON(stdout, &st); err != nil {
		return Status{}, fmt.Errorf("%w: %v", ErrDecode, err)
	}
	st.Raw = append([]byte(nil), stdout...)
	return st, nil
}

// LoginAPIKey logs in using Bitwarden API key values.
// This method does NOT store session; it just performs login.
func (c *Client) LoginAPIKey(ctx context.Context, serverURL, clientID, clientSecret string) error {
	// bw login --apikey --raw with env variable set accordingly
	env := map[string]string{
		"BW_SERVER_URL":   serverURL,
		"BW_CLIENTID":     clientID,
		"BW_CLIENTSECRET": clientSecret,
	}
	_, _, _, err := c.run(ctx, "", []string{"login", "--apikey", "--raw"}, env)
	return err
}

// Unlock unlocks the vault and returns the session token (bw unlock --raw).
// The session MUST be passed per command via BW_SESSION env by the caller.
func (c *Client) Unlock(ctx context.Context, masterPassword string) (string, error) {
	stdin := []byte(masterPassword + "\n")
	stdout, _, _, err := c.run(ctx, "", []string{"unlock", "--raw"}, nil, withStdin(stdin))
	if err != nil {
		return "", err
	}
	session := strings.TrimSpace(string(stdout))
	if session == "" {
		// If bw succeeded but returned empty, treat as CLI error.
		return "", fmt.Errorf("%w: empty session", ErrCLI)
	}
	return session, nil
}

func (c *Client) Sync(ctx context.Context, session string) error {
	_, _, _, err := c.run(ctx, session, []string{"sync"}, nil)
	return err
}

func (c *Client) ListItems(ctx context.Context, session string) ([]Item, error) {
	stdout, _, _, err := c.run(ctx, session, []string{"list", "items"}, nil)
	if err != nil {
		return nil, err
	}

	// bw returns an array.
	var rawItems []json.RawMessage
	if err := json.Unmarshal(stdout, &rawItems); err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDecode, err)
	}

	items := make([]Item, 0, len(rawItems))
	for _, rm := range rawItems {
		var it Item
		if err := json.Unmarshal(rm, &it); err != nil {
			return nil, fmt.Errorf("%w: %v", ErrDecode, err)
		}
		it.Raw = append([]byte(nil), rm...)
		items = append(items, it)
	}

	return items, nil
}

func (c *Client) GetItem(ctx context.Context, session, itemID string) (Item, error) {
	stdout, _, _, err := c.run(ctx, session, []string{"get", "item", itemID}, nil)
	if err != nil {
		return Item{}, err
	}
	var it Item
	if err := decodeJSON(stdout, &it); err != nil {
		return Item{}, fmt.Errorf("%w: %v", ErrDecode, err)
	}
	it.Raw = append([]byte(nil), stdout...)
	return it, nil
}

func (c *Client) CreateItem(ctx context.Context, session string, item Item) (Item, error) {
	payload, err := json.Marshal(item)
	if err != nil {
		return Item{}, fmt.Errorf("%w: %v", ErrDecode, err)
	}

	stdout, _, _, err := c.run(ctx, session, []string{"create", "item"}, nil, withStdin(payload))
	if err != nil {
		return Item{}, err
	}
	var created Item
	if err := decodeJSON(stdout, &created); err != nil {
		return Item{}, fmt.Errorf("%w: %v", ErrDecode, err)
	}
	created.Raw = append([]byte(nil), stdout...)
	return created, nil
}

func (c *Client) EditItem(ctx context.Context, session, itemID string, item Item) (Item, error) {
	payload, err := json.Marshal(item)
	if err != nil {
		return Item{}, fmt.Errorf("%w: %v", ErrDecode, err)
	}

	stdout, _, _, err := c.run(ctx, session, []string{"edit", "item", itemID}, nil, withStdin(payload))
	if err != nil {
		return Item{}, err
	}
	var edited Item
	if err := decodeJSON(stdout, &edited); err != nil {
		return Item{}, fmt.Errorf("%w: %v", ErrDecode, err)
	}
	edited.Raw = append([]byte(nil), stdout...)
	return edited, nil
}

func (c *Client) ListOrganizations(ctx context.Context, session string) ([]Organization, error) {
	stdout, _, _, err := c.run(ctx, session, []string{"list", "organizations"}, nil)
	if err != nil {
		return nil, err
	}

	var raw []json.RawMessage
	if err := json.Unmarshal(stdout, &raw); err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDecode, err)
	}

	out := make([]Organization, 0, len(raw))
	for _, rm := range raw {
		var o Organization
		if err := json.Unmarshal(rm, &o); err != nil {
			return nil, fmt.Errorf("%w: %v", ErrDecode, err)
		}
		o.Raw = append([]byte(nil), rm...)
		out = append(out, o)
	}
	return out, nil
}

func (c *Client) ListCollections(ctx context.Context, session, organizationID string) ([]Collection, error) {
	args := []string{"list", "collections"}
	if organizationID != "" {
		args = append(args, "--organizationid", organizationID)
	}

	stdout, _, _, err := c.run(ctx, session, args, nil)
	if err != nil {
		return nil, err
	}

	var raw []json.RawMessage
	if err := json.Unmarshal(stdout, &raw); err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDecode, err)
	}

	out := make([]Collection, 0, len(raw))
	for _, rm := range raw {
		var col Collection
		if err := json.Unmarshal(rm, &col); err != nil {
			return nil, fmt.Errorf("%w: %v", ErrDecode, err)
		}
		col.Raw = append([]byte(nil), rm...)
		out = append(out, col)
	}
	return out, nil
}

// UpsertItemByName lists items once and then chooses create vs edit.
// Returns (item, created, error).
func (c *Client) UpsertItemByName(ctx context.Context, session string, item Item) (Item, bool, error) {
	items, err := c.ListItems(ctx, session)
	if err != nil {
		return Item{}, false, err
	}
	for _, it := range items {
		if it.Name == item.Name && it.Name != "" {
			edited, err := c.EditItem(ctx, session, it.ID, item)
			return edited, false, err
		}
	}
	created, err := c.CreateItem(ctx, session, item)
	return created, true, err
}

// ---- internal helpers ----

type runOptions struct {
	stdin []byte
}

type runOpt func(*runOptions)

func withStdin(b []byte) runOpt {
	return func(o *runOptions) { o.stdin = b }
}

func (c *Client) run(ctx context.Context, session string, args []string, env map[string]string, opts ...runOpt) ([]byte, []byte, int, error) {
	o := &runOptions{}
	for _, opt := range opts {
		opt(o)
	}
	finalEnv := cloneMap(c.extraEnv)
	maps.Copy(finalEnv, env)
	if session != "" {
		finalEnv["BW_SESSION"] = session
	}

	fmt.Printf("finalenv: %v", finalEnv)

	start := time.Now()
	stdout, stderr, exitCode, err := c.runner.Run(ctx, c.bwPath, args, finalEnv, o.stdin)
	dur := time.Since(start)

	evt := c.log.Info().
		Str("bin", "bw").
		Str("op", safeOpName(args)).
		Int("exit_code", exitCode).
		Dur("duration", dur)

	if err != nil {
		evt = c.log.Warn().
			Str("bin", "bw").
			Str("op", safeOpName(args)).
			Int("exit_code", exitCode).
			Dur("duration", dur)
	}
	evt.Send()

	// Context errors first (avoid re-wrapping cancellations as CLI errors).
	if errors.Is(err, context.DeadlineExceeded) {
		return stdout, stderr, exitCode, fmt.Errorf("%w: %v", ErrTimeout, err)
	}
	if errors.Is(err, context.Canceled) {
		return stdout, stderr, exitCode, err
	}

	// Map bw failures to sentinels.
	if exitCode != 0 || err != nil {
		mapped := mapBWError(stdout, stderr)
		if mapped != nil {
			return stdout, stderr, exitCode, mapped
		}
		// Generic CLI error, include a small, sanitized snippet.
		snip := sanitizeForError(stderr)
		if snip == "" {
			snip = sanitizeForError(stdout)
		}
		if snip != "" {
			return stdout, stderr, exitCode, fmt.Errorf("%w: %s", ErrCLI, snip)
		}
		return stdout, stderr, exitCode, fmt.Errorf("%w", ErrCLI)
	}

	return stdout, stderr, exitCode, nil
}

func decodeJSON(b []byte, v any) error {
	dec := json.NewDecoder(bytes.NewReader(b))
	dec.DisallowUnknownFields() // NOTE: This would break resilience; so we DO NOT disallow.
	// We keep decoder for potential future streaming, but just unmarshal:
	return json.Unmarshal(b, v)
}

func safeOpName(args []string) string {
	if len(args) == 0 {
		return "bw"
	}
	// e.g. "list items" -> "list_items"
	return strings.ReplaceAll(strings.Join(args, "_"), "-", "_")
}

// sanitizeForError returns a small, printable snippet.
// This is used only for error messages, not logs.
// DO NOT include stdin/env/session, and avoid dumping JSON payloads.
// We keep it short and strip newlines.
func sanitizeForError(b []byte) string {
	s := strings.TrimSpace(string(b))
	s = strings.ReplaceAll(s, "\n", " ")
	s = strings.ReplaceAll(s, "\r", " ")
	if len(s) > 200 {
		s = s[:200] + "…"
	}
	return s
}

func mapBWError(stdout, stderr []byte) error {
	s := strings.ToLower(string(stderr))
	o := strings.ToLower(string(stdout))
	combined := s + "\n" + o

	// Common bw CLI messages (best-effort substring mapping).
	switch {
	case strings.Contains(combined, "you are not logged in"),
		strings.Contains(combined, "not logged in"),
		strings.Contains(combined, "invalid session"),
		strings.Contains(combined, "invalid or unknown session"),
		strings.Contains(combined, "unauthorized"):
		return ErrUnauthorized

	case strings.Contains(combined, "vault is locked"),
		strings.Contains(combined, "is locked"),
		strings.Contains(combined, "locked."):
		return ErrLocked

	case strings.Contains(combined, "not found"),
		strings.Contains(combined, "does not exist"):
		return ErrNotFound
	}

	return nil
}

func cloneMap(m map[string]string) map[string]string {
	if m == nil {
		return map[string]string{}
	}
	out := map[string]string{}
	maps.Copy(out, m)
	return out
}
