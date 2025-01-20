package k8s

import (
	"context"

	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"

	"k8s.io/apimachinery/pkg/api/errors"
)

type DeleteFacade struct {
	ctx        context.Context
	deployment *Deployment
	namespace  *Namespace
	service    *Service
	configmap  *configmap
	ingress    *ingress
	pvc        *PVC
	appConfig  *config.Configuration
	name       string
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

	prefix, name, err := mapper.MapContainerOrPrefixToPrefixName(request.Target)
	if err != nil {
		return err
	}

	if name != "" {
		return Delete(c, prefix, name)
	}

	del := NewDeleteFacade(c, prefix, "", cfg)
	return del.DeleteNamespace(prefix)
}

// soft-delete: deployment,services,configmaps, ingresses
func Delete(c context.Context, prefix, name string) error {
	cfg := grpc.GetConfigFromContext(c).(*config.Configuration)

	del := NewDeleteFacade(c, prefix, name, cfg)

	// delete deployment is necessary while others are optional
	// deployments contain containers
	err := del.DeleteDeployment()
	if errors.IsNotFound(err) {
		log.Fatal().Err(err).Stack().
			Str("prefix", prefix).
			Str("name", name).
			Msg("Failed to delete container (not found)")
		return err
	} else if err != nil {
		log.Fatal().Err(err).Stack().
			Str("prefix", prefix).
			Str("name", name).
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
