// file: bwcli/client.go
package bwcli

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"maps"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"sync"
	"time"

	"github.com/rs/zerolog"
)

// Usage example:
//
//	logger := zerolog.New(os.Stdout).With().Timestamp().Logger()
//	c := bwcli.New(&bwcli.Config{Logger: logger})
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

const (
	ArbitraryErrorMaxLength = 200
	DefaultBwBinary         = "bw"
	vaultDirPerm            = 0o700
)

type Config struct {
	Runner   Runner
	ExtraEnv map[string]string
	BWPath   string
	WorkDir  string
	HostURL  string
	Logger   zerolog.Logger
}

type Client struct {
	runner          Runner
	extraEnv        map[string]string
	bwPath          string
	workDir         string
	releasePathLock func()
	log             zerolog.Logger
}

// vaultPathLocks serializes concurrent access to the same BW_DATA_PATH.
// bw corrupts its session files when two processes share the same data directory.
var vaultPathLocks sync.Map // map[string]*sync.Mutex

func acquireVaultPath(path string) func() {
	val, _ := vaultPathLocks.LoadOrStore(path, &sync.Mutex{})
	mu := val.(*sync.Mutex)
	mu.Lock()
	return mu.Unlock
}

func bwDataPath(serverURL, userID string) (string, error) {
	h := sha256.Sum256([]byte(serverURL + "|" + userID))
	dir := filepath.Join(os.TempDir(), "dyo-agent-vault", hex.EncodeToString(h[:16]))
	if err := os.MkdirAll(dir, vaultDirPerm); err != nil {
		return "", err
	}
	return dir, nil
}

// Cleanup releases the per-path lock acquired by ConfigureAgentTempDir.
// Always call this with defer after creating a Client for a vault operation.
func (c *Client) Cleanup() {
	if c.releasePathLock != nil {
		c.releasePathLock()
		c.releasePathLock = nil
	}
}

func New(cfg *Config) *Client {
	bw := cfg.BWPath
	if bw == "" {
		bw = DefaultBwBinary
	}

	l := cfg.Logger
	// fallback logger is noop
	if l.GetLevel() == zerolog.NoLevel {
		l = zerolog.Nop()
	}

	r := cfg.Runner
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

// EnsureServer ensures bw is configured to use serverURL.
// If the current server differs, it logs out (required by bw) and updates it.
func (c *Client) EnsureServer(ctx context.Context, serverURL string, env map[string]string) error {
	res := c.run(ctx, "", []string{"config", "server"}, env)
	if res.Err != nil {
		// If bw can't read config yet (fresh BW_DATA_PATH), we can attempt to set it.
		// But most of the time this command succeeds.
		// Fall through to set.
		c.log.Trace().Err(res.Err).Msgf("server config read, ignored error")
	} else {
		current := strings.TrimSpace(string(res.Stdout))
		if current == "" || equalServerURL(current, serverURL) {
			c.log.Trace().Msgf("bw server URL in config identical")
			return nil
		}

		// 2) Different server → bw requires logout before changing server config.
		_ = c.LogoutWithEnv(ctx, env) // ignore not logged in
	}
	return c.run(ctx, "", []string{"config", "server", serverURL}, env).Err
}

func (c *Client) ConfigureAgentTempDir(serverURL, userID string) error {
	dir, err := bwDataPath(serverURL, userID)
	if err != nil {
		return err
	}
	c.releasePathLock = acquireVaultPath(dir)
	if c.extraEnv == nil {
		c.extraEnv = map[string]string{}
	}
	c.extraEnv["BW_DATA_PATH"] = dir
	c.extraEnv["BW_SERVER_URL"] = serverURL
	return nil
}

func (c *Client) LogoutWithEnv(ctx context.Context, env map[string]string) error {
	res := c.run(ctx, "", []string{"logout"}, env)
	if errors.Is(res.Err, ErrUnauthorized) {
		return nil
	}
	return res.Err
}

func (c *Client) Status(ctx context.Context) (Status, error) {
	res := c.run(ctx, "", []string{"status"}, nil)
	if res.Err != nil {
		return Status{}, res.Err
	}
	var st Status
	if err := decodeJSON(res.Stdout, &st); err != nil {
		return Status{}, fmt.Errorf("decode status: %w", err)
	}
	st.Raw = slices.Clone(res.Stdout)
	return st, nil
}

func (c *Client) encode(ctx context.Context, session string, jsonPayload []byte) (string, error) {
	res := c.run(ctx, session, []string{"encode"}, nil, withStdin(jsonPayload))
	if res.Err != nil {
		return "", res.Err
	}
	return strings.TrimSpace(string(res.Stdout)), nil
}

func equalServerURL(a, b string) bool {
	a = strings.TrimRight(strings.TrimSpace(a), "/")
	b = strings.TrimRight(strings.TrimSpace(b), "/")
	return strings.EqualFold(a, b)
}

// LoginAPIKey logs in using Bitwarden API key values.
// This method does NOT store session; it just performs login.
func (c *Client) LoginAPIKey(ctx context.Context, serverURL, clientID, clientSecret string) error {
	if err := c.ConfigureAgentTempDir(serverURL, clientID); err != nil {
		return err
	}

	env := map[string]string{
		"BW_CLIENTID":     clientID,
		"BW_CLIENTSECRET": clientSecret,
	}

	err := c.EnsureServer(ctx, serverURL, env)
	if err != nil {
		return err
	}
	return c.run(ctx, "", []string{"login", "--apikey"}, env).Err
}

// Unlock unlocks the vault and returns the session token (bw unlock --raw).
// The session MUST be passed per command via BW_SESSION env by the caller.
func (c *Client) Unlock(ctx context.Context, masterPassword string) (string, error) {
	stdin := []byte(masterPassword + "\n")
	res := c.run(ctx, "", []string{"unlock", "--raw"}, nil, withStdin(stdin))
	if res.Err != nil {
		return "", res.Err
	}
	session := strings.TrimSpace(string(res.Stdout))
	if session == "" {
		// If bw succeeded but returned empty, treat as CLI error.
		return "", fmt.Errorf("%w: empty session", ErrCLI)
	}
	return session, nil
}

func (c *Client) Sync(ctx context.Context, session string) error {
	return c.run(ctx, session, []string{"sync"}, nil).Err
}

func (c *Client) ListItems(ctx context.Context, session string) ([]Item, error) {
	res := c.run(ctx, session, []string{"list", "items"}, nil)
	if res.Err != nil {
		return nil, res.Err
	}
	data := extractJSON(res)
	if len(data) == 0 {
		return []Item{}, nil
	}
	return decodeRawList(data, "decode items array", "decode item", func(it *Item, rm json.RawMessage) {
		it.Raw = slices.Clone(rm)
	})
}

func (c *Client) GetItem(ctx context.Context, session, itemID string) (Item, error) {
	res := c.run(ctx, session, []string{"get", "item", itemID}, nil)
	if res.Err != nil {
		return Item{}, res.Err
	}
	data := extractJSON(res)
	c.log.Trace().
		Str("stdout", sanitizeForError(res.Stdout)).
		Str("stderr", sanitizeForError(res.StdErr)).
		Str("json", sanitizeForError(data)).
		Msg("get item raw output")
	if len(data) == 0 {
		return Item{}, ErrNotFound
	}
	var it Item
	if err := decodeJSON(data, &it); err != nil {
		return Item{}, fmt.Errorf("decode item: %w", err)
	}
	c.log.Trace().Str("id", it.ID).Str("name", it.Name).Msg("get item parsed")
	it.Raw = slices.Clone(data)
	return it, nil
}

func (c *Client) CreateItem(ctx context.Context, session string, item *Item) (Item, error) {
	payload, err := json.Marshal(item)
	if err != nil {
		return Item{}, fmt.Errorf("marshal item: %w", err)
	}

	encoded, err := c.encode(ctx, session, payload)
	if err != nil {
		return Item{}, err
	}

	res := c.run(ctx, session, []string{"create", "item", encoded}, nil)
	if res.Err != nil {
		return Item{}, res.Err
	}
	c.log.Trace().Str("name", item.Name).Msgf("item created")
	data := extractJSON(res)
	if len(data) == 0 {
		return *item, nil
	}
	var created Item
	if err := decodeJSON(data, &created); err != nil {
		return Item{}, fmt.Errorf("decode created item: %w", err)
	}
	created.Raw = slices.Clone(data)
	return created, nil
}

func (c *Client) UpsertSecureNote(
	ctx context.Context,
	session string,
	name string,
	notes string,
	orgID string,
	collectionIDs []string,
	hiddenFields map[string]string,
) (Item, bool, error) {
	if strings.TrimSpace(name) == "" {
		return Item{}, false, fmt.Errorf("%w: name is required", ErrCLI)
	}
	if hiddenFields == nil {
		hiddenFields = map[string]string{}
	}

	// Guardrail: collections require org.
	if orgID == "" && len(collectionIDs) > 0 {
		return Item{}, false, fmt.Errorf("%w: collectionIDs requires orgID", ErrCLI)
	}

	// Find existing by name directly.
	existing, err := c.GetItem(ctx, session, name)
	if errors.Is(err, ErrMultipleResults) {
		// bw fuzzy-matched multiple items — resolve by exact name via list.
		existing, err = c.findItemByExactName(ctx, session, name)
	}
	if err != nil && !errors.Is(err, ErrNotFound) {
		return Item{}, false, err
	}

	// Update existing
	if err == nil {
		applyAuthoritativeSecureNote(&existing, name, notes, orgID, collectionIDs, hiddenFields)
		edited, editErr := c.EditItem(ctx, session, existing.ID, &existing)
		if editErr == nil {
			c.log.Info().Str("name", name).Int("fields", len(hiddenFields)).Msg("vault note updated")
		}
		return edited, false, editErr
	}

	// Create new — applyAuthoritativeSecureNote sets every field we need,
	// so no template fetch is required.
	var base Item
	applyAuthoritativeSecureNote(&base, name, notes, orgID, collectionIDs, hiddenFields)

	created, err := c.CreateItem(ctx, session, &base) // CreateItem must encode+create
	if err == nil {
		c.log.Info().Str("name", name).Int("fields", len(hiddenFields)).Msg("vault note created")
	}
	return created, true, err
}

func (c *Client) findItemByExactName(ctx context.Context, session, name string) (Item, error) {
	items, err := c.ListItems(ctx, session)
	if err != nil {
		return Item{}, err
	}
	for i := range items {
		if items[i].Name == name {
			return items[i], nil
		}
	}
	return Item{}, ErrNotFound
}

// applyAuthoritativeSecureNote configures it to match the desired secure note state.
func applyAuthoritativeSecureNote(it *Item, name, notes, orgID string, collectionIDs []string, hiddenFields map[string]string) {
	// Ensure this is a secure note.
	it.Type = SecureNoteItemType
	it.Name = name
	it.Notes = notes
	if it.SecureNote == nil {
		it.SecureNote = &SecureNote{Type: SecureNoteTypeGeneric}
	} else {
		it.SecureNote.Type = SecureNoteTypeGeneric
	}

	// Org + collections (authoritative).
	it.OrganizationID = orgID
	if orgID == "" {
		it.CollectionIDs = nil
	} else {
		// Copy to avoid retaining caller slice.
		it.CollectionIDs = slices.Clone(collectionIDs)
	}

	// Hidden fields: exact set.
	// 1) Remove any *hidden* fields not in desired map.
	if len(it.Fields) > 0 {
		out := it.Fields[:0]
		for _, f := range it.Fields {
			if f.Type == FieldTypeHidden {
				if _, ok := hiddenFields[f.Name]; !ok {
					continue // drop
				}
			}
			out = append(out, f)
		}
		it.Fields = out
	}

	// 2) Upsert desired hidden fields.
	for k, v := range hiddenFields {
		it.SetField(k, v, FieldTypeHidden)
	}
}

func (c *Client) EditItem(ctx context.Context, session, itemID string, item *Item) (Item, error) {
	payload, err := json.Marshal(item)
	if err != nil {
		return Item{}, fmt.Errorf("marshal item: %w", err)
	}

	encoded, err := c.encode(ctx, session, payload)
	if err != nil {
		return Item{}, err
	}

	res := c.run(ctx, session, []string{"edit", "item", itemID, encoded}, nil)
	if res.Err != nil {
		return Item{}, res.Err
	}
	data := extractJSON(res)
	if len(data) == 0 {
		return *item, nil
	}
	var edited Item
	if err := decodeJSON(data, &edited); err != nil {
		return Item{}, fmt.Errorf("decode edited item: %w", err)
	}
	edited.Raw = slices.Clone(data)
	return edited, nil
}

func (c *Client) ListOrganizations(ctx context.Context, session string) ([]Organization, error) {
	res := c.run(ctx, session, []string{"list", "organizations"}, nil)
	if res.Err != nil {
		return nil, res.Err
	}
	return decodeRawList(res.Stdout, "decode organizations array", "decode organization", func(o *Organization, rm json.RawMessage) {
		o.Raw = slices.Clone(rm)
	})
}

func (c *Client) ListCollections(ctx context.Context, session, organizationID string) ([]Collection, error) {
	args := []string{"list", "collections"}
	if organizationID != "" {
		args = append(args, "--organizationid", organizationID)
	}

	res := c.run(ctx, session, args, nil)
	if res.Err != nil {
		return nil, res.Err
	}
	return decodeRawList(res.Stdout, "decode collections array", "decode collection", func(col *Collection, rm json.RawMessage) {
		col.Raw = slices.Clone(rm)
	})
}

// UpsertItemByName lists items once and then chooses create vs edit.
// Returns (item, created, error).
func (c *Client) UpsertItemByName(ctx context.Context, session string, item *Item) (Item, bool, error) {
	items, err := c.ListItems(ctx, session)
	if err != nil {
		return Item{}, false, err
	}
	for i := range items {
		if items[i].Name == item.Name && item.Name != "" {
			edited, err := c.EditItem(ctx, session, items[i].ID, item)
			return edited, false, err
		}
	}
	created, createErr := c.CreateItem(ctx, session, item)
	return created, true, createErr
}

// ---- internal helpers ----

type runOptions struct {
	stdin []byte
}

type runOpt func(*runOptions)

func withStdin(b []byte) runOpt {
	return func(o *runOptions) { o.stdin = b }
}

func (c *Client) run(ctx context.Context, session string, args []string, env map[string]string, opts ...runOpt) RunResult {
	o := &runOptions{}
	for _, opt := range opts {
		opt(o)
	}
	finalEnv := cloneMap(c.extraEnv)
	maps.Copy(finalEnv, env)
	if session != "" {
		finalEnv["BW_SESSION"] = session
	}

	start := time.Now()
	res := c.runner.Run(ctx, c.bwPath, args, finalEnv, o.stdin)
	dur := time.Since(start)

	evt := c.log.Debug().
		Str("bin", c.bwPath).
		Str("op", safeOpName(args)).
		Int("exit_code", res.ExitCode).
		Dur("duration", dur)

	if res.Err != nil {
		evt = c.log.Warn().
			Str("bin", c.bwPath).
			Str("op", safeOpName(args)).
			Int("exit_code", res.ExitCode).
			Dur("duration", dur)
	}
	evt.Send()

	// Context errors first (avoid re-wrapping cancellations as CLI errors).
	if errors.Is(res.Err, context.DeadlineExceeded) {
		res.Err = fmt.Errorf("%w: %v", ErrTimeout, res.Err)
		return res
	}
	if errors.Is(res.Err, context.Canceled) {
		return res
	}

	// Detect bw prompting for master password (session missing/expired).
	// This can happen even on exit 0 when multiple bw processes share a BW_DATA_PATH.
	// Skip for "unlock" itself — it naturally displays the prompt on stderr while
	// reading the password from stdin.
	isUnlockCmd := len(args) > 0 && args[0] == "unlock"
	if !isUnlockCmd && strings.Contains(strings.ToLower(string(res.StdErr)), "master password") {
		res.Err = ErrLocked
		return res
	}

	// Map bw failures to sentinels.
	mapped := mapBWError(res.Stdout, res.StdErr)
	if res.ExitCode != 0 || res.Err != nil {
		res.Err = mapped
		return res
	}

	return res
}

// decodeRawList decodes a JSON array into a typed slice, calling setRaw for each element.
func decodeRawList[T any](data []byte, arrayErr, itemErr string, setRaw func(*T, json.RawMessage)) ([]T, error) {
	var raw []json.RawMessage
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, fmt.Errorf("%s: %w", arrayErr, err)
	}
	out := make([]T, 0, len(raw))
	for _, rm := range raw {
		var v T
		if err := json.Unmarshal(rm, &v); err != nil {
			return nil, fmt.Errorf("%s: %w", itemErr, err)
		}
		setRaw(&v, rm)
		out = append(out, v)
	}
	return out, nil
}

func decodeJSON(b []byte, v any) error {
	return json.Unmarshal(b, v)
}

func safeOpName(args []string) string {
	if len(args) == 0 {
		return DefaultBwBinary
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
	if len(s) > ArbitraryErrorMaxLength {
		s = s[:ArbitraryErrorMaxLength] + "…"
	}
	return s
}

func mapBWError(stdout, stderr []byte) error {
	s := strings.ToLower(string(stderr))
	o := strings.ToLower(string(stdout))
	combined := s + "\n" + o

	// Common bw CLI messages (best-effort substring mapping).
	switch {
	case strings.Contains(combined, "you are already logged in as"):
		// swallowing the already logged in error, it's not a real one
		return nil
	case strings.Contains(combined, "user decryption options"):
		return ErrServerVersionMismatch

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

	case strings.Contains(combined, "more than one result"):
		return ErrMultipleResults
	default:
		snip := sanitizeForError(stderr)
		if snip == "" {
			snip = sanitizeForError(stdout)
		}
		if snip != "" {
			return fmt.Errorf("%w: %s", ErrCLI, snip)
		}
		return ErrCLI
	}
}

// trimToJSON advances past any leading bytes that are not '{' or '[',
// handling BOMs, ANSI escape sequences, and other non-JSON prefixes.
// Returns nil if no JSON start character is found.
// For '[', validates that it looks like a real JSON array (not text like "[input is hidden]").
func trimToJSON(b []byte) []byte {
	for i, c := range b {
		if c == '{' {
			return b[i:]
		}
		if c == '[' && isJSONArrayStart(b[i:]) {
			return b[i:]
		}
	}
	return nil
}

// isJSONValueStart returns true if c can be the first non-whitespace byte of
// a JSON value or the closing ']' of an empty array.
func isJSONValueStart(c byte) bool {
	return c == '{' || c == '[' || c == '"' || c == ']' ||
		c == '-' || (c >= '0' && c <= '9') ||
		c == 't' || c == 'f' || c == 'n'
}

// isJSONArrayStart returns true if b begins with '[' followed by a valid JSON value or ']'.
func isJSONArrayStart(b []byte) bool {
	const MinJSONSize = 2
	if len(b) < MinJSONSize {
		return false
	}
	for _, c := range b[1:] {
		if c == ' ' || c == '\t' || c == '\n' || c == '\r' {
			continue
		}
		return isJSONValueStart(c)
	}
	return false
}

// extractJSON returns the first parseable JSON slice from the run result.
// Some bw builds write JSON to stderr; others mix non-JSON text into stdout.
// Try stdout first, fall back to stderr.
func extractJSON(res RunResult) []byte {
	if j := trimToJSON(res.Stdout); j != nil {
		return j
	}
	return trimToJSON(res.StdErr)
}

func cloneMap(m map[string]string) map[string]string {
	if m == nil {
		return map[string]string{}
	}
	out := map[string]string{}
	maps.Copy(out, m)
	return out
}
