package k8s

import (
	"context"
	"fmt"

	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"

	"k8s.io/apimachinery/pkg/api/errors"
)

type DeleteFacade struct {
	ctx        context.Context
	name       string
	deployment *Deployment
	namespace  *Namespace
	service    *Service
	configmap  *configmap
	ingress    *ingress
	pvc        *PVC
	appConfig  *config.Configuration
}

func NewDeleteFacade(ctx context.Context, namespace, name string, cfg *config.Configuration) *DeleteFacade {
	k8sClient := NewClient(cfg)

	return &DeleteFacade{
		ctx:        ctx,
		name:       name,
		namespace:  NewNamespaceClient(ctx, namespace, k8sClient),
		deployment: NewDeployment(ctx, cfg),
		configmap:  newConfigmap(ctx, cfg),
		service:    NewService(ctx, k8sClient),
		ingress:    newIngress(ctx, k8sClient),
		pvc:        NewPVC(ctx, k8sClient),
		appConfig:  cfg,
	}
}

func (d *DeleteFacade) DeleteNamespace(namespace string) error {
	return d.namespace.DeleteNamespace(namespace)
}

func (d *DeleteFacade) DeleteDeployment() error {
	return d.deployment.deleteDeployment(d.namespace.name, d.name)
}

func (d *DeleteFacade) DeleteConfigMaps() error {
	return d.configmap.deleteConfigMaps(d.namespace.name, d.name)
}

func (d *DeleteFacade) DeleteServices() error {
	return d.service.deleteServices(d.namespace.name, d.name)
}

func (d *DeleteFacade) DeleteIngresses() error {
	return d.ingress.deleteIngress(d.namespace.name, d.name)
}

// hard-delete if called with prefix name only without container name
func DeleteMultiple(c context.Context, request *common.DeleteContainersRequest) error {
	cfg := grpc.GetConfigFromContext(c).(*config.Configuration)
	if ns := request.GetPrefix(); ns != "" {
		if deploymentName := request.GetPrefixName(); deploymentName != nil {
			return Delete(c, ns, deploymentName.Name)
		}
		del := NewDeleteFacade(c, ns, "", cfg)
		return del.DeleteNamespace(ns)
	}
	return fmt.Errorf("invalid DeleteContainers request")
}

// soft-delete: deployment,services,configmaps, ingresses
func Delete(c context.Context, containerPreName, containerName string) error {
	cfg := grpc.GetConfigFromContext(c).(*config.Configuration)

	del := NewDeleteFacade(c, containerPreName, containerName, cfg)

	// delete deployment is necessary while others are optional
	// deployments contain containers
	err := del.DeleteDeployment()
	if errors.IsNotFound(err) {
		log.Fatal().Err(err).Stack().
			Str("containerPreName", containerPreName).
			Str("containerName", containerName).
			Msg("Failed to delete container (not found)")
		return err
	} else if err != nil {
		log.Fatal().Err(err).Stack().
			Str("containerPreName", containerPreName).
			Str("containerName", containerName).
			Msg("Failed to delete container")
		return err
	}

	// optional deletes, each deploy request overwrites/redeploys them anyway
	err = del.DeleteServices()
	if !errors.IsNotFound(err) && err != nil {
		log.Error().Err(err).Stack().Msg("Delete service error")
	}

	err = del.DeleteConfigMaps()
	if !errors.IsNotFound(err) && err != nil {
		log.Error().Err(err).Stack().Msg("Delete configmaps error")
	}

	err = del.DeleteIngresses()
	if !errors.IsNotFound(err) && err != nil {
		log.Error().Err(err).Stack().Msg("Delete ingress error")
	}

	return nil
}
