package k8s

import (
	"context"
	"fmt"

	"github.com/rs/zerolog/log"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	imageHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	builder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"

	"k8s.io/apimachinery/pkg/api/errors"
)

type DeployFacade struct {
	ctx            context.Context
	params         *DeployFacadeParams
	client         *Client
	image          string
	deployment     *Deployment
	namespace      *Namespace
	service        *Service
	configmap      *configmap
	ingress        *ingress
	secret         *Secret
	pvc            *PVC
	ServiceMonitor *ServiceMonitor
	appConfig      *config.Configuration
}

type DeployFacadeParams struct {
	Ctx              context.Context
	Image            string
	InstanceConfig   v1.InstanceConfig
	ContainerConfig  v1.ContainerConfig
	RuntimeConfig    *string
	imagePullSecrets *imageHelper.RegistryAuth
	Issuer           string
}

func NewDeployFacade(params *DeployFacadeParams, cfg *config.Configuration) *DeployFacade {
	k8sClient := NewClient(cfg)

	serviceMonitor, err := NewServiceMonitor(params.Ctx, k8sClient)
	if err != nil {
		log.Warn().Err(err).Msgf("service client could not be created")
	}

	return &DeployFacade{
		ctx:            params.Ctx,
		params:         params,
		image:          params.Image,
		client:         k8sClient,
		namespace:      NewNamespaceClient(params.Ctx, params.InstanceConfig.ContainerPreName, k8sClient),
		deployment:     NewDeployment(params.Ctx, cfg),
		configmap:      newConfigmap(params.Ctx, cfg),
		service:        NewService(params.Ctx, k8sClient),
		ingress:        newIngress(params.Ctx, k8sClient),
		secret:         NewSecret(params.Ctx, k8sClient),
		pvc:            NewPVC(params.Ctx, k8sClient),
		ServiceMonitor: serviceMonitor,
		appConfig:      cfg,
	}
}

func (d *DeployFacade) CheckPreConditions() error {
	clientSet, err := d.client.GetClientSet()
	if err != nil {
		return fmt.Errorf("connection check error: %w", err)
	}

	_, _, err = clientSet.ServerGroupsAndResources()
	if err != nil {
		return fmt.Errorf("connection & auth check error: %w", err)
	}

	// additional k8s specific validation here
	if d.params.InstanceConfig.Name == "" && len(d.params.InstanceConfig.Environment) > 0 {
		return fmt.Errorf("instance config name must be provided with environments")
	}

	err = d.namespace.DeployNamespace(d.params.InstanceConfig.ContainerPreName)
	if err != nil && !errors.IsNotFound(err) {
		return fmt.Errorf("pre-deployment failure: %w", err)
	}

	return nil
}

// TODO docs
func (d *DeployFacade) PreDeploy() error {
	if d.params.InstanceConfig.UseSharedEnvs {
		if err := d.configmap.loadSharedConfig(d.namespace.name); err != nil {
			return err
		}
	} else {
		if d.params.InstanceConfig.SharedEnvironment != nil {
			if err := d.configmap.deployConfigMapData(
				d.namespace.name,
				d.params.InstanceConfig.ContainerPreName+"-shared",
				mapper.PipeSeparatedToStringMap(&d.params.InstanceConfig.SharedEnvironment),
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
			mapper.PipeSeparatedToStringMap(&d.params.InstanceConfig.Environment),
		); err != nil {
			log.Error().Err(err).Stack().Msg("Common config map error")
			return err
		}
	}

	if d.params.ContainerConfig.Environment != nil {
		if err := d.configmap.deployConfigMapData(
			d.namespace.name,
			d.params.ContainerConfig.Container,
			mapper.PipeSeparatedToStringMap(&d.params.ContainerConfig.Environment),
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

	if err := d.pvc.DeployPVC(
		d.namespace.name,
		d.params.ContainerConfig.Container,
		d.params.ContainerConfig.Mounts,
		d.params.ContainerConfig.Volumes,
	); err != nil {
		log.Error().Err(err).Stack().Msg("PVC deployment failed")
		return err
	}

	if err := d.secret.applySecrets(
		d.namespace.name,
		d.params.ContainerConfig.Container,
		d.params.ContainerConfig.Secrets); err != nil {
		return err
	}

	return nil
}

func (d *DeployFacade) Deploy() error {
	var portList []builder.PortBinding
	if d.params.ContainerConfig.Ports != nil {
		portList = append(portList, d.params.ContainerConfig.Ports...)
	}
	if err := d.service.DeployService(
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

	imagePullSecretName := ""

	if d.params.imagePullSecrets != nil {
		imagePullSecretName = fmt.Sprintf("%s-reg", d.params.ContainerConfig.Container)
		if err := d.secret.ApplyRegistryAuthSecret(d.ctx,
			d.params.InstanceConfig.ContainerPreName,
			imagePullSecretName,
			d.params.imagePullSecrets,
			d.appConfig); err != nil {
			return err
		}
	}

	if err := d.deployment.DeployDeployment(&deploymentParams{
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
		pullSecretName:  imagePullSecretName,
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
				annotations:   d.params.ContainerConfig.Annotations.Ingress,
				labels:        d.params.ContainerConfig.Labels.Ingress,
			},
		); err != nil {
			log.Error().Err(err).Stack().Msg("Error with ingress")
		}
	}

	return nil
}

func (d *DeployFacade) PostDeploy() error {
	if d.params.ContainerConfig.Metrics != nil && len(d.service.portNames) != 0 {
		err := d.ServiceMonitor.Deploy(d.namespace.name,
			d.params.ContainerConfig.Container,
			*d.params.ContainerConfig.Metrics,
			d.service.portNames[0],
		)
		if err != nil {
			return err
		}
	} else if d.ServiceMonitor != nil {
		err := d.ServiceMonitor.Cleanup(d.namespace.name, d.params.ContainerConfig.Container)
		if !errors.IsNotFound(err) {
			return err
		}
	}

	return nil
}

func (d *DeployFacade) Clear() error {
	return nil
}

func Deploy(c context.Context, dog *dogger.DeploymentLogger, deployImageRequest *v1.DeployImageRequest,
	versionData *v1.VersionData,
) error {
	cfg := grpc.GetConfigFromContext(c).(*config.Configuration)
	dog.Write(deployImageRequest.Strings(&cfg.CommonConfiguration)...)
	dog.Write(deployImageRequest.InstanceConfig.Strings()...)
	dog.Write(deployImageRequest.ContainerConfig.Strings(&cfg.CommonConfiguration)...)

	imageName := util.JoinV("/",
		*deployImageRequest.Registry,
		util.JoinV(":", deployImageRequest.ImageName, deployImageRequest.Tag))

	expandedImageName, err := imageHelper.ExpandImageName(imageName)
	if err != nil {
		return err
	}

	log.Info().Str("name", imageName).Str("full", expandedImageName).Msg("Image name parsed")

	deployFacade := NewDeployFacade(
		&DeployFacadeParams{
			Ctx:              c,
			Image:            expandedImageName,
			InstanceConfig:   deployImageRequest.InstanceConfig,
			ContainerConfig:  deployImageRequest.ContainerConfig,
			Issuer:           deployImageRequest.Issuer,
			imagePullSecrets: deployImageRequest.RegistryAuth,
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
