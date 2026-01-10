package main

import (
	"context"
	"fmt"
	"os"

	bwcli "github.com/dyrector-io/dyrectorio/golang/internal/vault/bwclient"
	"github.com/dyrector-io/dyrectorio/golang/internal/vault/vaultclient"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func SaveSecrets(ctx context.Context) error {
	// cfg := vaultwardenclient.Config{
	// }

	// bw serve must already be running and unlocked:
	//   bw serve --hostname 127.0.0.1 --port 8087
	client, err := vaultclient.NewClient(ctx, vaultclient.Config{
		BaseURL: "http://127.0.0.1:8087",
	})
	if err != nil {
		return fmt.Errorf("%v", err)
	}

	// Optional: ensure bw serve is unlocked
	st, err := client.Status(ctx)
	if err != nil {
		return fmt.Errorf("%w", err)
	}
	if st.Status() != "unlocked" {
		return fmt.Errorf("bw serve is not unlocked (status=%q)", st.Status())
	} else {
		log.Trace().Msg("bwserve is in an unlocked state")
	}

	orgID := "97fb008f-01db-4b80-9da1-bb0fadd69e88" // e.g. UUID from bw list organizations

	// Create an organization collection
	col, err := client.CreateCollection(ctx, vaultclient.CreateCollectionInput{
		OrganizationID: orgID,
		Name:           "prod/billing",
	})
	if err != nil {
		return err
	}

	// Create a secure-note “secret” item with custom fields
	secret, err := client.CreateSecret(ctx, vaultclient.SecretInput{
		OrganizationID: orgID,
		CollectionIDs:  []string{col.ID},
		Env:            "prod",
		Project:        "billing",
		Service:        "api",
		Data: map[string]string{
			"DATABASE_URL": "postgres://user:pass@host/db",
			"JWT_SECRET":   "supersecret",
		},
		Notes: "created by automation",
	})
	if err != nil {
		return err
	}

	log.Printf("created collection: %s (%s)", col.Name, col.ID)
	log.Printf("created secret item: %s (%s)", secret.Name, secret.ID)
	return nil
}

func TestClient(ctx context.Context) error {
	logger := zerolog.New(os.Stdout).With().Timestamp().Logger()
	c := bwcli.New(bwcli.Config{Logger: logger, ExtraEnv: map[string]string{
		"BW_SERVER_URL": "",
	}})

	st, err := c.Status(ctx)
	if err != nil {
		return err
	}
	log.Debug().Msgf("status: %v", st)

	err = c.LoginAPIKey(ctx)
	if err != nil {
		return err
	}
	log.Debug().Msgf("logged in with api key")

	session, err := c.Unlock(ctx, "CicaMaca@$")
	if err != nil {
		return err
	}

	if err := c.Sync(ctx, session); err != nil {
		return err
	}

	items, err := c.ListItems(ctx, session)
	if err != nil {
		return err
	}
	log.Printf("items: %v", items)

	return nil
}

func main() {
	// err := SaveSecrets(context.Background())
	err := TestClient(context.Background())
	if err != nil {
		fmt.Print(err)
	}
}
