package k8s

import (
	"context"
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

func (d *deleteFacade) DeleteNamespace(namespace string) error {
	return DeleteNamespace(namespace)
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
