package k8s

import (
	"context"
	"errors"
	"strings"

	"github.com/rs/zerolog/log"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	builder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
)

type deployFacade struct {
	ctx        context.Context
	params     *DeployFacadeParams
	image      util.ImageURI
	deployment *deployment
	namespace  *namespace
	service    *service
	configmap  *configmap
	ingress    *ingress
	secret     *secret
	pvc        *pvc
	appConfig  *config.Configuration
}

type DeployFacade interface {
	CheckPreConditions() error
	PreDeploy() error
	Deploy() error
	PostDeploy() error
	Clear() error
}

type DeployFacadeParams struct {
	Ctx             context.Context
	Image           util.ImageURI
	InstanceConfig  v1.InstanceConfig
	ContainerConfig v1.ContainerConfig
	RuntimeConfig   *string
	Issuer          string
}

func NewDeployFacade(params *DeployFacadeParams, cfg *config.Configuration) *deployFacade {
	return &deployFacade{
		ctx:        params.Ctx,
		params:     params,
		image:      params.Image,
		namespace:  newNamespace(params.Ctx, params.InstanceConfig.ContainerPreName, cfg),
		deployment: newDeployment(params.Ctx, cfg),
		configmap:  newConfigmap(params.Ctx, cfg),
		service:    newService(params.Ctx, cfg),
		ingress:    newIngress(params.Ctx, cfg),
		secret:     newSecret(params.Ctx, cfg),
		appConfig:  cfg,

		pvc: newPvc(params.Ctx, cfg),
	}
}

func (d *deployFacade) CheckPreConditions() error {
	if err := d.namespace.deployNamespace(); err != nil {
		return err
	}

	// additional k8s specific validation here
	if d.params.InstanceConfig.Name == "" && len(d.params.InstanceConfig.Environment) > 0 {
		return errors.New("instance config name must be provided with environments")
	}

	return nil
}

// TODO docs
func (d *deployFacade) PreDeploy() error {
	if d.params.InstanceConfig.UseSharedEnvs {
		if err := d.configmap.loadSharedConfig(d.namespace.name); err != nil {
			return err
		}
	} else {
		if d.params.InstanceConfig.SharedEnvironment != nil {
			if err := d.configmap.deployConfigMapData(
				d.namespace.name,
				d.params.InstanceConfig.ContainerPreName+"-shared",
				strArrToStrMap(d.params.InstanceConfig.SharedEnvironment),
			); err != nil {
				log.Error().Err(err).Stack().Msg("Namespace global config map error")
				return err
			}
		}
	}

	if d.params.InstanceConfig.Environment != nil {
		if err := d.configmap.deployConfigMapData(
			d.namespace.name,
			d.params.InstanceConfig.Name+"-common",
			strArrToStrMap(d.params.InstanceConfig.Environment),
		); err != nil {
			log.Error().Err(err).Stack().Msg("Common config map error")
			return err
		}
	}

	if d.params.ContainerConfig.Environment != nil {
		if err := d.configmap.deployConfigMapData(
			d.namespace.name,
			d.params.ContainerConfig.Container,
			strArrToStrMap(d.params.ContainerConfig.Environment),
		); err != nil {
			log.Error().Err(err).Stack().Msg("Container config map error")
			return err
		}
	}

	if err := d.configmap.deployConfigMapRuntime(
		d.params.ContainerConfig.RuntimeConfigType,
		d.namespace.name,
		d.params.ContainerConfig.Container,
		d.params.RuntimeConfig); err != nil {
		log.Error().Err(err).Stack().Msg("Container configMap-runtime error")
		return err
	}

	if err := d.pvc.deployPVC(
		d.namespace.name,
		d.params.ContainerConfig.Container,
		d.params.ContainerConfig.Mounts,
		d.params.ContainerConfig.Volumes,
	); err != nil {
		log.Error().Err(err).Stack().Msg("PVC deployment failed")
		return err
	}

	if err := d.secret.applySecrets(d.namespace.name, d.params.ContainerConfig.Container, d.params.ContainerConfig.Secrets); err != nil {
		return err
	}

	return nil
}

func (d *deployFacade) Deploy() error {
	var portList []builder.PortBinding
	if d.params.ContainerConfig.Ports != nil {
		portList = append(portList, d.params.ContainerConfig.Ports...)
	}
	if err := d.service.deployService(
		&ServiceParams{
			namespace:     d.params.InstanceConfig.ContainerPreName,
			name:          d.params.ContainerConfig.Container,
			selector:      d.params.ContainerConfig.Container,
			portBindings:  portList,
			portRanges:    d.params.ContainerConfig.PortRanges,
			useLB:         d.params.ContainerConfig.UseLoadBalancer,
			LBAnnotations: d.params.ContainerConfig.ExtraLBAnnotations,
			annotations:   d.params.ContainerConfig.Annotations.Service,
			labels:        d.params.ContainerConfig.Labels.Service,
		},
	); err != nil {
		log.Error().Err(err).Stack().Msg("Error with service")
		return err
	}

	if err := d.deployment.deployDeployment(&deploymentParams{
		image:           d.params.Image,
		namespace:       d.params.InstanceConfig.ContainerPreName,
		containerConfig: &d.params.ContainerConfig,
		configMapsEnv:   d.configmap.avail,
		secrets:         d.secret.avail,
		volumes:         d.pvc.avail,
		portList:        portList,
		command:         d.params.ContainerConfig.Command,
		args:            d.params.ContainerConfig.Args,
		issuer:          d.params.Issuer,
		annotations:     d.params.ContainerConfig.Annotations.Deployment,
		labels:          d.params.ContainerConfig.Labels.Deployment,
	}); err != nil {
		log.Error().Err(err).Stack().Msg("Error with deployment")
		return err
	}

	if d.params.ContainerConfig.Expose {
		if err := d.ingress.deployIngress(
			&DeployIngressOptions{
				namespace:     d.namespace.name,
				containerName: d.params.ContainerConfig.Container,
				ingressName:   d.params.ContainerConfig.IngressName,
				ingressHost:   d.params.ContainerConfig.IngressHost,
				uploadLimit:   d.params.ContainerConfig.IngressUploadLimit,
				ports:         d.service.portsBound,
				tls:           d.params.ContainerConfig.ExposeTLS,
				proxyHeaders:  d.params.ContainerConfig.ProxyHeaders,
				customHeaders: d.params.ContainerConfig.CustomHeaders,
				annotations:   d.params.ContainerConfig.Annotations.Ingress,
				labels:        d.params.ContainerConfig.Labels.Ingress,
			},
		); err != nil {
			log.Error().Err(err).Stack().Msg("Error with ingress")
		}
	}

	return nil
}

func (d *deployFacade) PostDeploy() error {
	return nil
}

func (d *deployFacade) Clear() error {
	return nil
}

func strArrToStrMap(str []string) map[string]string {
	mapped := map[string]string{}
	for _, e := range str {
		if strings.ContainsRune(e, '|') {
			eSplit := strings.Split(e, "|")
			mapped[eSplit[0]] = eSplit[1]
		}
	}
	return mapped
}

func Deploy(c context.Context, dog *dogger.DeploymentLogger, deployImageRequest *v1.DeployImageRequest,
	versionData *v1.VersionData,
) error {
	cfg := grpc.GetConfigFromContext(c).(*config.Configuration)
	dog.Write(deployImageRequest.Strings(&cfg.CommonConfiguration)...)
	dog.Write(deployImageRequest.InstanceConfig.Strings()...)
	dog.Write(deployImageRequest.ContainerConfig.Strings(&cfg.CommonConfiguration)...)

	deployFacade := NewDeployFacade(
		&DeployFacadeParams{
			Ctx: c,
			Image: util.ImageURI{
				Host: util.GetRegistryURL(deployImageRequest.Registry, deployImageRequest.RegistryAuth),
				Name: deployImageRequest.ImageName,
				Tag:  deployImageRequest.Tag,
			},
			InstanceConfig:  deployImageRequest.InstanceConfig,
			ContainerConfig: deployImageRequest.ContainerConfig,
			Issuer:          deployImageRequest.Issuer,
		},
		cfg,
	)

	if err := deployFacade.CheckPreConditions(); err != nil {
		return err
	}

	if err := deployFacade.PreDeploy(); err != nil {
		return err
	}

	if err := deployFacade.Deploy(); err != nil {
		return err
	}

	if err := deployFacade.PostDeploy(); err != nil {
		return err
	}
	return nil
}
