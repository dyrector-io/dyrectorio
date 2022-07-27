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

func (d *deleteFacade) DeleteNamespace(namespace string, config *config.Configuration) error {
	return DeleteNamespace(namespace, config)
}

func (d *deleteFacade) DeleteDeployment(config *config.Configuration) error {
	return d.deployment.deleteDeployment(d.namespace.name, d.name, config)
}

func (d *deleteFacade) DeleteConfigMaps(config *config.Configuration) error {
	return d.configmap.deleteConfigMaps(d.namespace.name, d.name, config)
}

func (d *deleteFacade) DeleteServices(config *config.Configuration) error {
	return d.service.deleteServices(d.namespace.name, d.name, config)
}

func (d *deleteFacade) DeleteIngresses(config *config.Configuration) error {
	return d.ingress.deleteIngress(d.namespace.name, d.name, config)
}
