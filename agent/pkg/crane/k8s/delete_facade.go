package k8s

import (
	"context"
	"log"

	"github.com/dyrector-io/dyrectorio/agent/internal/grpc"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"

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

func Delete(c context.Context, containerPreName, containerName string) error {
	cfg := grpc.GetConfigFromContext(c).(*config.Configuration)

	del := NewDeleteFacade(c, containerPreName, containerName, cfg)

	// delete deployment is necessary while others are optional
	// deployments contain containers
	err := del.DeleteDeployment()
	if errors.IsNotFound(err) {
		log.Fatalf("Failed to delete container (not found) %s-%s %v", containerPreName, containerName, err)
		return err
	} else if err != nil {
		log.Fatalf("Failed to delete container %s-%s %v", containerPreName, containerName, err)
		return err
	}

	// optional deletes, each deploy request overwrites/redeploys them anyway
	err = del.DeleteServices()
	if !errors.IsNotFound(err) && err != nil {
		log.Println("Delete service error: " + err.Error())
	}

	err = del.DeleteConfigMaps()
	if !errors.IsNotFound(err) && err != nil {
		log.Println("Delete configmaps error: " + err.Error())
	}

	err = del.DeleteIngresses()
	if !errors.IsNotFound(err) && err != nil {
		log.Println("Delete ingress error: " + err.Error())
	}

	return nil
}
