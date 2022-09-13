package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"

	containerbuilder "github.com/dyrector-io/dyrectorio/agent/pkg/builder/container"
)

type DyrectorioStack struct {
	Containers     Containers
	Crux           *containerbuilder.DockerContainerBuilder
	CruxMigrate    *containerbuilder.DockerContainerBuilder
	CruxUI         *containerbuilder.DockerContainerBuilder
	Kratos         *containerbuilder.DockerContainerBuilder
	KratosMigrate  *containerbuilder.DockerContainerBuilder
	CruxPostgres   *containerbuilder.DockerContainerBuilder
	KratosPostgres *containerbuilder.DockerContainerBuilder
	MailSlurper    *containerbuilder.DockerContainerBuilder
}

const ContainerNetDriver = "bridge"

func ProcessCommand(settings *Settings) {
	containers := DyrectorioStack{
		Containers: settings.Containers,
	}

	switch settings.Command {
	case "up":
		containers.Crux = GetCrux(settings)
		containers.CruxMigrate = GetCruxMigrate(settings)
		containers.CruxUI = GetCruxUI(settings)
		containers.Kratos = GetKratos(settings)
		containers.KratosMigrate = GetKratosMigrate(settings)
		containers.CruxPostgres = GetCruxPostgres(settings)
		containers.KratosPostgres = GetKratosPostgres(settings)
		containers.MailSlurper = GetMailSlurper(settings)

		StartContainers(&containers)
	case "down":
		StopContainers(&containers)
	default:
		log.Fatalln("invalid command")
	}
}

// Create and Start containers
func StartContainers(containers *DyrectorioStack) {
	_, err := containers.CruxPostgres.Create().Start()
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	_, err = containers.KratosPostgres.Create().Start()
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	log.Printf("Migration (kratos) in progress...")
	_, err = containers.KratosMigrate.Create().StartWaitUntilExit()
	if err != nil {
		log.Fatalf("error: %v", err)
	}
	log.Printf("Migration (kratos) done!")

	_, err = containers.Kratos.Create().Start()
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	if !containers.Containers.Crux.Disabled {
		log.Printf("Migration (crux) in progress...")
		_, err = containers.CruxMigrate.Create().StartWaitUntilExit()
		if err != nil {
			log.Fatalf("error: %v", err)
		}
		log.Printf("Migration (crux) done!")

		_, err = containers.Crux.Create().Start()
		if err != nil {
			log.Fatalf("error: %v", err)
		}
	}

	if !containers.Containers.CruxUI.Disabled {
		_, err = containers.CruxUI.Create().Start()
		if err != nil {
			log.Fatalf("error: %v", err)
		}
	}

	_, err = containers.MailSlurper.Create().Start()
	if err != nil {
		log.Fatalf("error: %v", err)
	}
}

// Cleanup for "down" command
func StopContainers(containers *DyrectorioStack) {
	if containerID := containers.Containers.MailSlurper.Name; GetContainerID(containerID) != "" {
		CleanupContainer(containerID)
	}

	if !containers.Containers.CruxUI.Disabled {
		if containerID := containers.Containers.CruxUI.Name; GetContainerID(containerID) != "" {
			CleanupContainer(containerID)
		}
	}

	if !containers.Containers.Crux.Disabled {
		if containerID := containers.Containers.Crux.Name; GetContainerID(containerID) != "" {
			CleanupContainer(containerID)
		}

		if containerID := containers.Containers.CruxMigrate.Name; GetContainerID(containerID) != "" {
			CleanupContainer(containerID)
		}
	}

	if containerID := containers.Containers.KratosMigrate.Name; GetContainerID(containerID) != "" {
		CleanupContainer(containerID)
	}

	if containerID := containers.Containers.Kratos.Name; GetContainerID(containerID) != "" {
		CleanupContainer(containerID)
	}

	if containerID := containers.Containers.CruxPostgres.Name; GetContainerID(containerID) != "" {
		CleanupContainer(containerID)
	}

	if containerID := containers.Containers.KratosPostgres.Name; GetContainerID(containerID) != "" {
		CleanupContainer(containerID)
	}
}

// Helper function to get the container's ID from name
func GetContainerID(name string) string {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	filter := filters.NewArgs()
	filter.Add("name", fmt.Sprintf("^%s$", name))

	containers, err := cli.ContainerList(
		context.Background(),
		types.ContainerListOptions{
			All:     true,
			Filters: filter,
		})
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	switch len(containers) {
	case 0:
		log.Printf("no such container found with name: %s", name)
		return ""
	case 1:
		return containers[0].ID
	default:
		log.Fatalf("error: ambigous name")
		return ""
	}
}

// Stop and Delete container
func CleanupContainer(id string) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	timeout, err := time.ParseDuration("10s")
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	err = cli.ContainerStop(context.Background(), id, &timeout)
	if err != nil {
		log.Printf("error: %v", err)
	}

	err = cli.ContainerRemove(context.Background(), id, types.ContainerRemoveOptions{Force: true, RemoveVolumes: false})
	if err != nil {
		log.Printf("error: %v", err)
	}
}

// Retrieving docker networks gateway IP
func GetNetworkGatewayIP(settings *Settings, networkID string) *Settings {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	filter := filters.NewArgs()
	filter.Add("id", fmt.Sprintf("^%s$", networkID))

	networks, err := cli.NetworkList(context.Background(),
		types.NetworkListOptions{
			Filters: filter,
		})
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

func EnsureNetworkExists(settings *Settings) string {
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
