// file: bwcli/types.go
package bwcli

import "encoding/json"

// Status mirrors the important parts of `bw status` output.
// Keep it resilient to schema changes.
type Status struct {
	ServerURL string          `json:"serverUrl,omitempty"`
	LastSync  string          `json:"lastSync,omitempty"`
	UserEmail string          `json:"userEmail,omitempty"`
	UserID    string          `json:"userId,omitempty"`
	Status    string          `json:"status,omitempty"` // "unauthenticated", "locked", "unlocked"
	Raw       json.RawMessage `json:"-"`
}

// Item is a minimal representation of Bitwarden items.
// Many fields are optional and vary by "type". Keep unknown parts in Raw.
type Item struct {
	ID              string          `json:"id,omitempty"`
	OrganizationID  string          `json:"organizationId,omitempty"`
	CollectionIds   []string        `json:"collectionIds,omitempty"`
	FolderID        string          `json:"folderId,omitempty"`
	Type            int             `json:"type,omitempty"`
	Name            string          `json:"name,omitempty"`
	Notes           string          `json:"notes,omitempty"`
	Favorite        bool            `json:"favorite,omitempty"`
	Reprompt        int             `json:"reprompt,omitempty"`
	Fields          json.RawMessage `json:"fields,omitempty"`
	Login           json.RawMessage `json:"login,omitempty"`
	SecureNote      json.RawMessage `json:"secureNote,omitempty"`
	Card            json.RawMessage `json:"card,omitempty"`
	Identity        json.RawMessage `json:"identity,omitempty"`
	PasswordHistory json.RawMessage `json:"passwordHistory,omitempty"`
	Raw             json.RawMessage `json:"-"`
}

// Organization / Collection kept minimal for backup grouping later.
type Organization struct {
	ID   string          `json:"id,omitempty"`
	Name string          `json:"name,omitempty"`
	Raw  json.RawMessage `json:"-"`
}

type Collection struct {
	ID             string          `json:"id,omitempty"`
	Name           string          `json:"name,omitempty"`
	OrganizationID string          `json:"organizationId,omitempty"`
	Raw            json.RawMessage `json:"-"`
}
