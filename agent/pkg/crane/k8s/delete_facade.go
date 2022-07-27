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
}

type DeleteFacade interface {
	Delete(namespace, name string) error
}

func NewDeleteFacade(ctx context.Context, namespace, name string) *deleteFacade {
	return &deleteFacade{
		ctx:        ctx,
		name:       name,
		namespace:  newNamespace(namespace),
		deployment: newDeployment(ctx),
		configmap:  newConfigmap(ctx),
		service:    newService(ctx),
		ingress:    newIngress(ctx),
		pvc:        newPvc(),
	}
}

func (d *deleteFacade) DeleteNamespace(namespace string, cfg *config.Configuration) error {
	return DeleteNamespace(namespace, cfg)
}

func (d *deleteFacade) DeleteDeployment(cfg *config.Configuration) error {
	return d.deployment.deleteDeployment(d.namespace.name, d.name, cfg)
}

func (d *deleteFacade) DeleteConfigMaps(cfg *config.Configuration) error {
	return d.configmap.deleteConfigMaps(d.namespace.name, d.name, cfg)
}

func (d *deleteFacade) DeleteServices(cfg *config.Configuration) error {
	return d.service.deleteServices(d.namespace.name, d.name, cfg)
}

func (d *deleteFacade) DeleteIngresses(cfg *config.Configuration) error {
	return d.ingress.deleteIngress(d.namespace.name, d.name, cfg)
}
