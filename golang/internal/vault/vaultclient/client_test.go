package vaultclient

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newTestClient(t *testing.T, base string, hc *http.Client) *Client {
	t.Helper()
	u, err := url.Parse(base)
	require.NoError(t, err)
	return &Client{
		baseURL:    u,
		httpClient: hc,
		authHeader: "Bearer test",
	}
}

func TestNewClient_Validation(t *testing.T) {
	ctx := context.Background()

	c, err := NewClient(ctx, Config{})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrMissingBaseURL)
	assert.Nil(t, c)
}

func TestClient_doRequest_Validation(t *testing.T) {
	ctx := context.Background()

	var nilClient *Client
	err := nilClient.doRequest(ctx, http.MethodGet, "/x", nil, nil)
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrNilClient)

	c := &Client{}
	err = c.doRequest(ctx, "", "/x", nil, nil)
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrEmptyMethod)

	err = c.doRequest(ctx, http.MethodGet, "", nil, nil)
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrEmptyPath)
}

func TestClient_doRequest_SetsAuthHeaderAndResolvesPath(t *testing.T) {
	ctx := context.Background()

	type reqBody struct {
		Foo string `json:"foo"`
	}
	type respBody struct {
		Bar string `json:"bar"`
	}

	var gotAuth string
	var gotPath string
	var gotBody reqBody

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotAuth = r.Header.Get("Authorization")
		gotPath = r.URL.Path
		_ = json.NewDecoder(r.Body).Decode(&gotBody)

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(respBody{Bar: "ok"})
	}))
	defer srv.Close()

	client := newTestClient(t, srv.URL, srv.Client())

	var out respBody
	err := client.doRequest(ctx, http.MethodPost, "/object/item", reqBody{Foo: "hello"}, &out)
	require.NoError(t, err)

	assert.Equal(t, "Bearer test", gotAuth)
	assert.Equal(t, "/object/item", gotPath)
	assert.Equal(t, "hello", gotBody.Foo)
	assert.Equal(t, "ok", out.Bar)
}

func TestClient_doRequest_EnvelopeDecode(t *testing.T) {
	ctx := context.Background()

	type item struct {
		ID string `json:"id"`
	}

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		env := map[string]any{
			"success": true,
			"data": map[string]any{
				"object": "item",
				"data": map[string]any{
					"id": "123",
				},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(env)
	}))
	defer srv.Close()

	client := newTestClient(t, srv.URL, srv.Client())

	var out item
	err := client.doRequest(ctx, http.MethodGet, "/object/item/123", nil, &out)
	require.NoError(t, err)
	assert.Equal(t, "123", out.ID)
}

func TestCreateCollection_Validation(t *testing.T) {
	ctx := context.Background()
	client := &Client{}

	col, err := client.CreateCollection(ctx, CreateCollectionInput{Name: "x"})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrMissingOrganizationID)
	assert.Nil(t, col)

	col, err = client.CreateCollection(ctx, CreateCollectionInput{OrganizationID: "ORG"})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrMissingName)
	assert.Nil(t, col)
}

func TestCreateCollection_Success(t *testing.T) {
	ctx := context.Background()

	var gotQuery string
	var gotBody map[string]any

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "/object/org-collection", r.URL.Path)
		gotQuery = r.URL.RawQuery
		_ = json.NewDecoder(r.Body).Decode(&gotBody)

		env := map[string]any{
			"success": true,
			"data": map[string]any{
				"object": "org-collection",
				"data": map[string]any{
					"id":             "col-1",
					"name":           gotBody["name"],
					"organizationId": gotBody["organizationId"],
				},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(env)
	}))
	defer srv.Close()

	client := newTestClient(t, srv.URL, srv.Client())

	col, err := client.CreateCollection(ctx, CreateCollectionInput{
		OrganizationID: "ORG-ID",
		Name:           "prod/billing",
	})
	require.NoError(t, err)

	assert.Contains(t, gotQuery, "organizationid=ORG-ID")
	assert.Equal(t, "prod/billing", gotBody["name"])
	assert.Equal(t, "ORG-ID", gotBody["organizationId"])
	assert.Equal(t, "col-1", col.ID)
}

func TestCreateSecret_Validation(t *testing.T) {
	ctx := context.Background()
	client := &Client{}

	sec, err := client.CreateSecret(ctx, SecretInput{
		Env:     "prod",
		Project: "p",
		Service: "s",
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrMissingOrganizationID)
	assert.Nil(t, sec)
}

func TestCreateSecret_Success_WithTemplateFallback(t *testing.T) {
	ctx := context.Background()

	var posted Cipher

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/object/template/item":
			// Simulate template missing to ensure fallback path works.
			w.WriteHeader(http.StatusNotFound)
			_, _ = w.Write([]byte("Not Found"))
			return
		case "/object/item":
			require.Equal(t, http.MethodPost, r.Method)
			require.NoError(t, json.NewDecoder(r.Body).Decode(&posted))

			env := map[string]any{
				"success": true,
				"data": map[string]any{
					"object": "item",
					"data": map[string]any{
						"id":             "item-1",
						"type":           posted.Type,
						"name":           posted.Name,
						"notes":          posted.Notes,
						"organizationId": posted.OrganizationID,
						"collectionIds":  posted.CollectionIDs,
						"fields":         posted.Fields,
					},
				},
			}
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(env)
			return
		default:
			w.WriteHeader(http.StatusNotFound)
			_, _ = w.Write([]byte("Not Found"))
			return
		}
	}))
	defer srv.Close()

	client := newTestClient(t, srv.URL, srv.Client())

	secret, err := client.CreateSecret(ctx, SecretInput{
		OrganizationID: "ORG-ID",
		CollectionIDs:  []string{"col-1"},
		Env:            "prod",
		Project:        "billing",
		Service:        "api",
		Data: map[string]string{
			"DATABASE_URL": "postgres://user:pass@host/db",
			"JWT_SECRET":   "supersecret",
		},
		Notes: "created by automation",
	})
	require.NoError(t, err)

	assert.Equal(t, "item-1", secret.ID)
	assert.Equal(t, 2, posted.Type)
	assert.Equal(t, "prod/billing/api", posted.Name)
	assert.Equal(t, "ORG-ID", posted.OrganizationID)
	assert.Equal(t, []string{"col-1"}, posted.CollectionIDs)
	assert.Len(t, posted.Fields, 5) // env, project, service + 2 secrets
}
