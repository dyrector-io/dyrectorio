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
//	c := bwcli.New(&bwcli.Config{HostURL: "https://vault.example.com", ClientID: "user.xxx"}, nil, logger)
//	defer c.Cleanup()
//
//	if err := c.LoginAPIKey(ctx); err != nil { ... }
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
	ExtraEnv     map[string]string
	BWPath       string
	WorkDir      string
	HostURL      string
	ClientID     string
	ClientSecret string
	Password     string
}

type BWClient struct {
	ctx             context.Context
	runner          Runner
	releasePathLock func()
	cfg             *Config
	log             *zerolog.Logger
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

// Cleanup releases the per-path lock acquired during New.
// Always call this with defer after creating a BWClient.
func (c *BWClient) Cleanup() {
	if c.releasePathLock != nil {
		c.releasePathLock()
		c.releasePathLock = nil
	}
}

func New(ctx context.Context, cfg *Config, runner Runner, logger *zerolog.Logger) *BWClient {
	l := logger
	// fallback logger is noop
	if l.GetLevel() == zerolog.NoLevel {
		noopLog := zerolog.Nop()
		l = &noopLog
	}

	// Work on a shallow copy so we don't mutate the caller's Config.
	c := *cfg
	if c.BWPath == "" {
		c.BWPath = DefaultBwBinary
	}

	bwTmpDataPath, err := bwDataPath(c.HostURL, c.ClientID)
	if err != nil {
		l.Warn().Msgf("bw data path setup failed: %v", err)
		return nil
	}
	l.Trace().Msgf("bw temporal datapath: %s", bwTmpDataPath)
	c.ExtraEnv = cloneMap(cfg.ExtraEnv)
	c.ExtraEnv["BW_DATA_PATH"] = bwTmpDataPath
	c.ExtraEnv["BW_SERVER_URL"] = c.HostURL
	c.ExtraEnv["BW_CLIENTID"] = c.ClientID
	c.ExtraEnv["BW_CLIENTSECRET"] = c.ClientSecret

	r := runner
	if r == nil {
		r = &ExecRunner{
			WorkDir: c.WorkDir,
			BaseEnv: c.ExtraEnv,
		}
	}

	return &BWClient{
		ctx:             ctx,
		runner:          r,
		cfg:             &c,
		log:             l,
		releasePathLock: acquireVaultPath(bwTmpDataPath),
	}
}

// EnsureServer ensures bw is configured to use serverURL.
// If the current server differs, it logs out (required by bw) and updates it.
func (c *BWClient) EnsureServer() error {
	res := c.run("", []string{"config", "server"}, c.cfg.ExtraEnv)
	if res.Err != nil {
		c.log.Trace().Err(res.Err).Msgf("server config read, ignored error")
	} else {
		current := strings.TrimSpace(string(res.Stdout))
		if current == "" || equalServerURL(current, c.cfg.HostURL) {
			c.log.Trace().Msgf("bw server URL in config identical")
			return nil
		}

		// 2) Different server → bw requires logout before changing server config.
		_ = c.LogoutWithEnv(c.cfg.ExtraEnv) // ignore not logged in
	}
	return c.run("", []string{"config", "server", c.cfg.HostURL}, c.cfg.ExtraEnv).Err
}

func (c *BWClient) LogoutWithEnv(env map[string]string) error {
	res := c.run("", []string{"logout"}, env)
	if errors.Is(res.Err, ErrUnauthorized) {
		return nil
	}
	return res.Err
}

func (c *BWClient) Status() (Status, error) {
	res := c.run("", []string{"status"}, nil)
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

func (c *BWClient) encode(session string, jsonPayload []byte) (string, error) {
	res := c.run(session, []string{"encode"}, nil, withStdin(jsonPayload))
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
func (c *BWClient) LoginAPIKey() error {
	if err := c.EnsureServer(); err != nil {
		return err
	}
	return c.run("", []string{"login", "--apikey"}, c.cfg.ExtraEnv).Err
}

// Unlock unlocks the vault and returns the session token (bw unlock --raw).
// The session MUST be passed per command via BW_SESSION env by the caller.
func (c *BWClient) Unlock(masterPassword string) (string, error) {
	stdin := []byte(masterPassword + "\n")
	res := c.run("", []string{"unlock", "--raw"}, nil, withStdin(stdin))
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

func (c *BWClient) Sync(session string) error {
	return c.run(session, []string{"sync"}, nil).Err
}

func (c *BWClient) ListItems(session string) ([]Item, error) {
	res := c.run(session, []string{"list", "items"}, nil)
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

func (c *BWClient) GetItem(session, itemID string) (Item, error) {
	res := c.run(session, []string{"get", "item", itemID}, nil)
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

func (c *BWClient) CreateItem(session string, item *Item) (Item, error) {
	payload, err := json.Marshal(item)
	if err != nil {
		return Item{}, fmt.Errorf("marshal item: %w", err)
	}

	encoded, err := c.encode(session, payload)
	if err != nil {
		return Item{}, err
	}

	res := c.run(session, []string{"create", "item", encoded}, nil)
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

func (c *BWClient) UpsertSecureNote(
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
	existing, err := c.GetItem(session, name)
	if errors.Is(err, ErrMultipleResults) {
		// bw fuzzy-matched multiple items — resolve by exact name via list.
		existing, err = c.findItemByExactName(session, name)
	}
	if err != nil && !errors.Is(err, ErrNotFound) {
		return Item{}, false, err
	}

	// Update existing
	if err == nil {
		applyAuthoritativeSecureNote(&existing, name, notes, orgID, collectionIDs, hiddenFields)
		edited, editErr := c.EditItem(session, existing.ID, &existing)
		if editErr == nil {
			c.log.Info().Str("name", name).Int("fields", len(hiddenFields)).Msg("vault note updated")
		}
		return edited, false, editErr
	}

	// Create new — applyAuthoritativeSecureNote sets every field we need,
	// so no template fetch is required.
	var base Item
	applyAuthoritativeSecureNote(&base, name, notes, orgID, collectionIDs, hiddenFields)

	created, err := c.CreateItem(session, &base) // CreateItem must encode+create
	if err == nil {
		c.log.Info().Str("name", name).Int("fields", len(hiddenFields)).Msg("vault note created")
	}
	return created, true, err
}

func (c *BWClient) findItemByExactName(session, name string) (Item, error) {
	items, err := c.ListItems(session)
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

func (c *BWClient) EditItem(session, itemID string, item *Item) (Item, error) {
	payload, err := json.Marshal(item)
	if err != nil {
		return Item{}, fmt.Errorf("marshal item: %w", err)
	}

	encoded, err := c.encode(session, payload)
	if err != nil {
		return Item{}, err
	}

	res := c.run(session, []string{"edit", "item", itemID, encoded}, nil)
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

func (c *BWClient) ListOrganizations(session string) ([]Organization, error) {
	res := c.run(session, []string{"list", "organizations"}, nil)
	if res.Err != nil {
		return nil, res.Err
	}
	return decodeRawList(res.Stdout, "decode organizations array", "decode organization", func(o *Organization, rm json.RawMessage) {
		o.Raw = slices.Clone(rm)
	})
}

func (c *BWClient) ListCollections(session, organizationID string) ([]Collection, error) {
	args := []string{"list", "collections"}
	if organizationID != "" {
		args = append(args, "--organizationid", organizationID)
	}

	res := c.run(session, args, nil)
	if res.Err != nil {
		return nil, res.Err
	}
	return decodeRawList(res.Stdout, "decode collections array", "decode collection", func(col *Collection, rm json.RawMessage) {
		col.Raw = slices.Clone(rm)
	})
}

// UpsertItemByName lists items once and then chooses create vs edit.
// Returns (item, created, error).
func (c *BWClient) UpsertItemByName(session string, item *Item) (Item, bool, error) {
	items, err := c.ListItems(session)
	if err != nil {
		return Item{}, false, err
	}
	for i := range items {
		if items[i].Name == item.Name && item.Name != "" {
			edited, err := c.EditItem(session, items[i].ID, item)
			return edited, false, err
		}
	}
	created, createErr := c.CreateItem(session, item)
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

func (c *BWClient) run(session string, args []string, env map[string]string, opts ...runOpt) RunResult {
	o := &runOptions{}
	for _, opt := range opts {
		opt(o)
	}
	finalEnv := cloneMap(c.cfg.ExtraEnv)
	maps.Copy(finalEnv, env)
	if session != "" {
		finalEnv["BW_SESSION"] = session
	}

	start := time.Now()
	res := c.runner.Run(c.ctx, c.cfg.BWPath, args, finalEnv, o.stdin)
	dur := time.Since(start)

	evt := c.log.Debug().
		Str("bin", c.cfg.BWPath).
		Str("op", safeOpName(args)).
		Int("exit_code", res.ExitCode).
		Dur("duration", dur)

	if res.Err != nil {
		evt = c.log.Warn().
			Str("bin", c.cfg.BWPath).
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
