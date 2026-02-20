// file: bwcli/types.go
package bwcli

import "encoding/json"

type FieldType int

const (
	FieldTypeText    FieldType = 0
	FieldTypeHidden  FieldType = 1
	FieldTypeBoolean FieldType = 2
	FieldTypeLinked  FieldType = 3
)

type Field struct {
	Name  string    `json:"name"`
	Value string    `json:"value,omitempty"`
	Type  FieldType `json:"type"`
}

type ItemType int

const (
	SecureNoteItemType ItemType = 2
)

type SecureNoteType int

const (
	SecureNoteTypeGeneric SecureNoteType = 0
)

type SecureNote struct {
	Type SecureNoteType `json:"type"`
}

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
	SecureNote      *SecureNote     `json:"secureNote,omitempty"`
	Notes           string          `json:"notes,omitempty"`
	FolderID        string          `json:"folderId,omitempty"`
	ID              string          `json:"id,omitempty"`
	Name            string          `json:"name,omitempty"`
	OrganizationID  string          `json:"organizationId,omitempty"`
	CollectionIDs   []string        `json:"collectionIds,omitempty"`
	Identity        json.RawMessage `json:"identity,omitempty"`
	Raw             json.RawMessage `json:"-"`
	PasswordHistory json.RawMessage `json:"passwordHistory,omitempty"`
	Fields          []Field         `json:"fields,omitempty"`
	Login           json.RawMessage `json:"login,omitempty"`
	Card            json.RawMessage `json:"card,omitempty"`
	Type            ItemType        `json:"type,omitempty"`
	Reprompt        int             `json:"reprompt,omitempty"`
	Favorite        bool            `json:"favorite,omitempty"`
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

func (i *Item) GetField(name string) (Field, bool) {
	for _, f := range i.Fields {
		if f.Name == name {
			return f, true
		}
	}
	return Field{}, false
}

func (i *Item) SetField(name, value string, t FieldType) {
	for idx, f := range i.Fields {
		if f.Name == name {
			i.Fields[idx].Value = value
			i.Fields[idx].Type = t
			return
		}
	}
	i.Fields = append(i.Fields, Field{
		Name:  name,
		Value: value,
		Type:  t,
	})
}
