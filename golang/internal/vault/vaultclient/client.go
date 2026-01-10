package vaultclient

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/rs/zerolog/log"
)

const (
	defaultDeviceName = "vaultwardenclient"
)

// Sentinel errors for clean, testable error handling.
var (
	ErrMissingBaseURL = errors.New("bwserve: BaseURL is required")
	ErrNilClient      = errors.New("bwserve: client is nil")
	ErrEmptyMethod    = errors.New("bwserve: HTTP method is required")
	ErrEmptyPath      = errors.New("bwserve: path is required")

	ErrMissingOrganizationID = errors.New("bwserve: OrganizationID is required")
	ErrMissingName           = errors.New("bwserve: Name is required")
	ErrMissingEnv            = errors.New("bwserve: Env is required")
	ErrMissingProject        = errors.New("bwserve: Project is required")
	ErrMissingService        = errors.New("bwserve: Service is required")
)

// Config configures the bw serve client.
type Config struct {
	// BaseURL is the bw serve base URL, e.g. http://127.0.0.1:8087
	BaseURL string

	// Optional: if you run bw serve behind a proxy that requires a header.
	// Not standard, but some setups gate it.
	Authorization string // e.g. "Bearer <token>"

	HTTPClient *http.Client // optional, defaults to http.DefaultClient
}

// Client is a reusable bw serve (Vault Management API) client.
type Client struct {
	baseURL    *url.URL
	httpClient *http.Client
	authHeader string
}

// NewClient constructs a new bw serve client.
func NewClient(_ context.Context, cfg Config) (*Client, error) {
	if strings.TrimSpace(cfg.BaseURL) == "" {
		log.Warn().Msg("bwserve: missing BaseURL in config")
		return nil, ErrMissingBaseURL
	}

	u, err := url.Parse(cfg.BaseURL)
	if err != nil {
		log.Error().Err(err).Str("base_url", cfg.BaseURL).Msg("bwserve: invalid BaseURL")
		return nil, fmt.Errorf("bwserve: invalid BaseURL: %w", err)
	}
	u.Path = strings.TrimRight(u.Path, "/")

	hc := cfg.HTTPClient
	if hc == nil {
		hc = http.DefaultClient
	}

	log.Debug().
		Str("base_url", u.String()).
		Bool("auth_header_set", cfg.Authorization != "").
		Msg("bwserve: created client")

	return &Client{
		baseURL:    u,
		httpClient: hc,
		authHeader: cfg.Authorization,
	}, nil
}

// bwServeEnvelope matches the common bw serve response envelope.
type bwServeEnvelope[T any] struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Data    struct {
		Object string `json:"object"`
		Data   T      `json:"data"`
	} `json:"data"`
}

// doRequest performs an HTTP request against bw serve.
//
// It supports both:
//  1. direct JSON objects, and
//  2. bw serve "envelope" objects: { success, data: { object, data }, message }
func (c *Client) doRequest(ctx context.Context, method, path string, body any, v any) error {
	if c == nil {
		log.Error().Msg("bwserve: nil client in doRequest")
		return ErrNilClient
	}
	if method == "" {
		log.Warn().Msg("bwserve: empty HTTP method in doRequest")
		return ErrEmptyMethod
	}

	rel := strings.TrimSpace(path)
	if rel == "" {
		log.Warn().Msg("bwserve: empty path in doRequest")
		return ErrEmptyPath
	}
	// allow callers to pass "object/item" or "/object/item"
	if !strings.HasPrefix(rel, "/") {
		rel = "/" + rel
	}

	relURL, err := url.Parse(rel)
	if err != nil {
		log.Error().Err(err).Str("path", path).Msg("bwserve: invalid path")
		return fmt.Errorf("bwserve: invalid path: %w", err)
	}

	u := c.baseURL.ResolveReference(relURL)

	var bodyReader io.Reader
	if body != nil {
		buf := &bytes.Buffer{}
		if err := json.NewEncoder(buf).Encode(body); err != nil {
			log.Error().Err(err).Str("url", u.String()).Msg("bwserve: encoding request body failed")
			return fmt.Errorf("bwserve: encoding body failed: %w", err)
		}
		bodyReader = buf
	}

	req, err := http.NewRequestWithContext(ctx, method, u.String(), bodyReader)
	if err != nil {
		log.Error().Err(err).Str("method", method).Str("url", u.String()).Msg("bwserve: creating request failed")
		return fmt.Errorf("bwserve: creating request failed: %w", err)
	}

	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if c.authHeader != "" {
		req.Header.Set("Authorization", c.authHeader)
	}

	log.Debug().
		Str("method", method).
		Str("url", u.String()).
		Msg("bwserve: sending request")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		log.Error().Err(err).Str("method", method).Str("url", u.String()).Msg("bwserve: request failed")
		return fmt.Errorf("bwserve: request failed: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Error().Err(err).Str("method", method).Str("url", u.String()).Msg("bwserve: reading response failed")
		return fmt.Errorf("bwserve: reading response failed: %w", err)
	}

	if resp.StatusCode/100 != 2 {
		msg := strings.TrimSpace(string(raw))
		if msg == "" {
			msg = http.StatusText(resp.StatusCode)
		}

		log.Error().
			Str("method", method).
			Str("url", u.String()).
			Int("status_code", resp.StatusCode).
			Msg("bwserve: non-2xx response")

		return fmt.Errorf("bwserve: unexpected status %d: %s", resp.StatusCode, msg)
	}

	if v == nil {
		return nil
	}

	// Try envelope first, fall back to plain object.
	{
		var probe map[string]any
		if err := json.Unmarshal(raw, &probe); err == nil {
			if _, ok := probe["success"]; ok {
				var env struct {
					Success bool   `json:"success"`
					Message string `json:"message,omitempty"`
					Data    struct {
						Object string          `json:"object"`
						Data   json.RawMessage `json:"data"`
					} `json:"data"`
				}
				if err := json.Unmarshal(raw, &env); err == nil {
					if !env.Success {
						msg := env.Message
						if msg == "" {
							msg = "request failed"
						}
						log.Error().Str("url", u.String()).Msg("bwserve: success=false in response")
						return fmt.Errorf("bwserve: %s", msg)
					}
					if err := json.Unmarshal(env.Data.Data, v); err != nil {
						log.Error().Err(err).Str("url", u.String()).Msg("bwserve: decoding envelope data failed")
						return fmt.Errorf("bwserve: decoding response failed: %w", err)
					}
					return nil
				}
			}
		}
	}

	if err := json.Unmarshal(raw, v); err != nil {
		log.Error().Err(err).Str("url", u.String()).Msg("bwserve: decoding response failed")
		return fmt.Errorf("bwserve: decoding response failed: %w", err)
	}

	return nil
}

// Status is the bw serve status response.
type StatusResponse struct {
	Success bool `json:"success"`
	Data    struct {
		Object   string `json:"object"`
		Template struct {
			ServerURL string `json:"serverUrl"`
			LastSync  string `json:"lastSync"`
			UserEmail string `json:"userEmail"`
			UserID    string `json:"userId"`
			Status    string `json:"status"` // "unlocked" / "locked"
		} `json:"template"`
	} `json:"data"`
}

func (r StatusResponse) Status() string {
	return r.Data.Template.Status
}

// Status fetches bw serve /status.
func (c *Client) Status(ctx context.Context) (*StatusResponse, error) {
	if c == nil {
		return nil, ErrNilClient
	}

	// Build URL safely
	relURL, err := url.Parse("/status")
	if err != nil {
		return nil, fmt.Errorf("bwserve: invalid status path: %w", err)
	}
	u := c.baseURL.ResolveReference(relURL)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, fmt.Errorf("bwserve: creating status request failed: %w", err)
	}
	if c.authHeader != "" {
		req.Header.Set("Authorization", c.authHeader)
	}

	log.Debug().Str("method", http.MethodGet).Str("url", u.String()).Msg("bwserve: sending request")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("bwserve: status request failed: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("bwserve: reading status response failed: %w", err)
	}

	if resp.StatusCode/100 != 2 {
		msg := strings.TrimSpace(string(raw))
		if msg == "" {
			msg = http.StatusText(resp.StatusCode)
		}
		return nil, fmt.Errorf("bwserve: unexpected status %d: %s", resp.StatusCode, msg)
	}

	var out StatusResponse
	if err := json.Unmarshal(raw, &out); err != nil {
		log.Error().Err(err).Str("url", u.String()).Msg("bwserve: decoding status failed")
		return nil, fmt.Errorf("bwserve: decoding status failed: %w", err)
	}

	if !out.Success {
		return nil, fmt.Errorf("bwserve: status returned success=false")
	}

	return &out, nil
}

/*
Collections (Org Collections)

bw serve exposes org collections via /object/org-collection endpoints.
Creating org collections is known to require organizationid in the query string.
*/

// Collection is a minimal org-collection representation.
type Collection struct {
	ID             string `json:"id,omitempty"`
	OrganizationID string `json:"organizationId,omitempty"`
	Name           string `json:"name"`
	ExternalID     string `json:"externalId,omitempty"`
}

// CreateCollectionInput creates an org collection.
type CreateCollectionInput struct {
	OrganizationID string
	Name           string
	ExternalID     string // optional
}

// CreateCollection creates an organization collection.
//
// Endpoint (bw serve):
//
//	POST /object/org-collection?organizationid=<orgId>
func (c *Client) CreateCollection(ctx context.Context, in CreateCollectionInput) (*Collection, error) {
	if strings.TrimSpace(in.OrganizationID) == "" {
		log.Warn().Msg("bwserve: missing OrganizationID in CreateCollection")
		return nil, ErrMissingOrganizationID
	}
	if strings.TrimSpace(in.Name) == "" {
		log.Warn().Msg("bwserve: missing Name in CreateCollection")
		return nil, ErrMissingName
	}

	body := map[string]any{
		"name":           in.Name,
		"organizationId": in.OrganizationID,
	}
	if strings.TrimSpace(in.ExternalID) != "" {
		body["externalId"] = in.ExternalID
	}

	q := url.Values{}
	q.Set("organizationid", in.OrganizationID)
	path := "/object/org-collection?" + q.Encode()

	var out Collection
	if err := c.doRequest(ctx, http.MethodPost, path, body, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

/*
Items (Ciphers)

bw serve supports:
  GET  /object/template/item
  POST /object/item
  GET  /object/item/{id}
  GET  /list/object/items

We model a "secret" as an item (cipher) with custom fields.
*/

// Field is a Bitwarden custom field.
type Field struct {
	Name  string `json:"name"`
	Value string `json:"value"`
	Type  int    `json:"type"` // 0 = text
}

// Cipher is a minimal item/cipher representation for bw serve.
type Cipher struct {
	ID             string   `json:"id,omitempty"`
	Type           int      `json:"type"` // 2 = Secure Note
	Name           string   `json:"name"`
	Notes          string   `json:"notes,omitempty"`
	OrganizationID string   `json:"organizationId,omitempty"`
	CollectionIDs  []string `json:"collectionIds,omitempty"`
	Fields         []Field  `json:"fields,omitempty"`
}

// SecretInput builds a secure-note item with fields.
type SecretInput struct {
	OrganizationID string
	CollectionIDs  []string
	Env            string
	Project        string
	Service        string
	Data           map[string]string
	Notes          string
}

// toCipher converts SecretInput into a secure-note Cipher.
func (in SecretInput) toCipher() Cipher {
	name := fmt.Sprintf("%s/%s/%s", in.Env, in.Project, in.Service)

	fields := make([]Field, 0, 3+len(in.Data))
	fields = append(fields,
		Field{Name: "env", Value: in.Env, Type: 0},
		Field{Name: "project", Value: in.Project, Type: 0},
		Field{Name: "service", Value: in.Service, Type: 0},
	)
	for k, v := range in.Data {
		fields = append(fields, Field{Name: k, Value: v, Type: 0})
	}

	return Cipher{
		Type:           2,
		Name:           name,
		Notes:          in.Notes,
		OrganizationID: in.OrganizationID,
		CollectionIDs:  in.CollectionIDs,
		Fields:         fields,
	}
}

// getItemTemplate fetches /object/template/item.
// If template is missing (some builds vary), we fall back to an empty Cipher.
func (c *Client) getItemTemplate(ctx context.Context) (Cipher, error) {
	var tmpl Cipher
	err := c.doRequest(ctx, http.MethodGet, "/object/template/item", nil, &tmpl)
	if err != nil {
		// Not fatal: some setups don’t expose templates consistently.
		log.Debug().Err(err).Msg("bwserve: item template not available, continuing without it")
		return Cipher{}, nil
	}
	return tmpl, nil
}

// CreateSecret creates a Secure Note item in the vault (bw serve).
//
// Endpoint:
//
//	POST /object/item
func (c *Client) CreateSecret(ctx context.Context, in SecretInput) (*Cipher, error) {
	if strings.TrimSpace(in.OrganizationID) == "" {
		log.Warn().Msg("bwserve: missing OrganizationID in CreateSecret")
		return nil, ErrMissingOrganizationID
	}
	if strings.TrimSpace(in.Env) == "" {
		log.Warn().Msg("bwserve: missing Env in CreateSecret")
		return nil, ErrMissingEnv
	}
	if strings.TrimSpace(in.Project) == "" {
		log.Warn().Msg("bwserve: missing Project in CreateSecret")
		return nil, ErrMissingProject
	}
	if strings.TrimSpace(in.Service) == "" {
		log.Warn().Msg("bwserve: missing Service in CreateSecret")
		return nil, ErrMissingService
	}

	tmpl, _ := c.getItemTemplate(ctx)
	cipher := tmpl
	override := in.toCipher()

	cipher.Type = override.Type
	cipher.Name = override.Name
	cipher.Notes = override.Notes
	cipher.OrganizationID = override.OrganizationID
	cipher.CollectionIDs = override.CollectionIDs
	cipher.Fields = override.Fields

	var out Cipher
	if err := c.doRequest(ctx, http.MethodPost, "/object/item", cipher, &out); err != nil {
		return nil, err
	}
	return &out, nil
}
