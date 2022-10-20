package k8s

import (
	"context"

	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"

	"k8s.io/apimachinery/pkg/api/errors"
)

type deleteFacade struct {
	ctx        context.Context
	name       string
	deployment *deployment
	namespace  *namespace
	service    *service
	configmap  *configmap
	ingress    *ingress
	pvc        *pvc
	appConfig  *config.Configuration
}

type DeleteFacade interface {
	Delete(namespace, name string) error
}

func NewDeleteFacade(ctx context.Context, namespace, name string, cfg *config.Configuration) *deleteFacade {
	return &deleteFacade{
		ctx:        ctx,
		name:       name,
		namespace:  newNamespace(ctx, namespace, cfg),
		deployment: newDeployment(ctx, cfg),
		configmap:  newConfigmap(ctx, cfg),
		service:    newService(ctx, cfg),
		ingress:    newIngress(ctx, cfg),
		pvc:        newPvc(ctx, cfg),
		appConfig:  cfg,
	}
}

func (d *deleteFacade) DeleteNamespace(namespace string) error {
	return DeleteNamespace(d.ctx, namespace, d.appConfig)
}

func (d *deleteFacade) DeleteDeployment() error {
	return d.deployment.deleteDeployment(d.namespace.name, d.name)
}

func (d *deleteFacade) DeleteConfigMaps() error {
	return d.configmap.deleteConfigMaps(d.namespace.name, d.name)
}

func (d *deleteFacade) DeleteServices() error {
	return d.service.deleteServices(d.namespace.name, d.name)
}

func (d *deleteFacade) DeleteIngresses() error {
	return d.ingress.deleteIngress(d.namespace.name, d.name)
}

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
