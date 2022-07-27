package k8s

import (
	"context"

	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"
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
		namespace:  newNamespace(namespace, cfg),
		deployment: newDeployment(ctx, cfg),
		configmap:  newConfigmap(ctx, cfg),
		service:    newService(ctx, cfg),
		ingress:    newIngress(ctx, cfg),
		pvc:        newPvc(cfg),
		appConfig:  cfg,
	}
}

func (d *deleteFacade) DeleteNamespace(namespace string) error {
	return DeleteNamespace(namespace, d.appConfig)
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
