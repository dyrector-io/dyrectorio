package main

import (
	"context"
	"fmt"
	"log"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
)

const ContainerNetDriver = "bridge"

// Start compose file
func RunContainers(settings Settings) {
	_, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	crux := GetCrux(settings)
	cruxMigrate := GetCruxMigrate(settings)
	cruxUI := GetCruxUI(settings)

	kratos := GetKratos(settings)
	kratosMigrate := GetKratosMigrate(settings)

	cruxPostgres := GetCruxPostgres(settings)
	kratosPostgres := GetKratosPostgres(settings)

	mailslurper := GetMailSlurper(settings)

	_, err = cruxPostgres.Create().Start()
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	_, err = kratosPostgres.Create().Start()
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	log.Printf("Migration (kratos) in progress...")
	_, err = kratosMigrate.Create().StartWaitUntilExit()
	if err != nil {
		log.Fatalf("error: %v", err)
	}
	log.Printf("Migration (kratos) done!")

	_, err = kratos.Create().Start()
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	if !settings.CruxDisabled {
		log.Printf("Migration (crux) in progress...")
		_, err = cruxMigrate.Create().StartWaitUntilExit()
		if err != nil {
			log.Fatalf("error: %v", err)
		}
		log.Printf("Migration (crux) done!")
		_, err = crux.Create().Start()
		if err != nil {
			log.Fatalf("error: %v", err)
		}
	}

	if !settings.CruxUIDisabled {
		_, err = cruxUI.Create().Start()
		if err != nil {
			log.Fatalf("error: %v", err)
		}
	}

	_, err = mailslurper.Create().Start()
	if err != nil {
		log.Fatalf("error: %v", err)
	}
}

// Retrieving docker networks gateway IP
func GetNetworkGatewayIP(settings Settings, networkID string) Settings {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	networks, err := cli.NetworkList(context.Background(),
		types.NetworkListOptions{
			Filters: filters.NewArgs(filters.Arg("ID", networkID))})
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	if len(networks) != 1 {
		log.Fatalf("error: ambigous network name")
	}

	if len(networks[0].IPAM.Config) != 1 {
		log.Fatalf("error: ambigous network subnet addresses")
	}

	settings.NetworkGatewayIP = networks[0].IPAM.Config[0].Gateway
	return settings
}

func EnsureNetworkExists(settings Settings) string {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	filter := filters.NewArgs()
	filter.Add("name", fmt.Sprintf("^%s$", settings.SettingsFile.Network))

	networks, err := cli.NetworkList(context.Background(),
		types.NetworkListOptions{
			Filters: filter,
		})
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	if len(networks) == 0 {
		opts := types.NetworkCreate{
			Driver: ContainerNetDriver,
		}

		resp, err := cli.NetworkCreate(context.Background(), settings.SettingsFile.Network, opts)
		log.Println(resp.ID, resp.Warning)
		if err != nil {
			log.Fatalf("error: %v", err)
		}
		return resp.ID
	}

	for i := range networks {
		if networks[i].Driver != ContainerNetDriver {
			log.Fatalf("error: %s network exists, but doesn't have the correct driver: %s",
				settings.SettingsFile.Network,
				ContainerNetDriver)
		} else {
			return networks[i].ID
		}
	}

	log.Fatalf("error: unknown network error")
	return ""
}
