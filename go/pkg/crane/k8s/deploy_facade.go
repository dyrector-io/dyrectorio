package k8s

import (
	"context"
	"errors"
	"log"
	"strings"

	"gitlab.com/dyrector_io/dyrector.io/go/internal/dogger"
	"gitlab.com/dyrector_io/dyrector.io/go/internal/util"
	v1 "gitlab.com/dyrector_io/dyrector.io/go/pkg/api/v1"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/crane/config"
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
	pvc        *pvc
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

func NewDeployFacade(params *DeployFacadeParams) *deployFacade {
	return &deployFacade{
		ctx:        params.Ctx,
		params:     params,
		image:      params.Image,
		namespace:  newNamespace(params.InstanceConfig.ContainerPreName),
		deployment: newDeployment(params.Ctx),
		configmap:  newConfigmap(params.Ctx),
		service:    newService(params.Ctx),
		ingress:    newIngress(params.Ctx),

		pvc: newPvc(),
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
				log.Println("Namespace global config map error: " + err.Error())
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
			log.Println("Common config map error: " + err.Error())
			return err
		}
	}

	if d.params.ContainerConfig.Environment != nil {
		if err := d.configmap.deployConfigMapData(
			d.namespace.name,
			d.params.ContainerConfig.Container,
			strArrToStrMap(d.params.ContainerConfig.Environment),
		); err != nil {
			log.Println("Container config map error: " + err.Error())
			return err
		}
	}

	if err := d.configmap.deployConfigMapRuntime(
		d.params.ContainerConfig.RuntimeConfigType,
		d.namespace.name,
		d.params.ContainerConfig.Container,
		d.params.RuntimeConfig); err != nil {
		log.Println("Container configMap-runtime error: ", err.Error())
		return err
	}

	if err := d.pvc.deployPVC(
		d.namespace.name,
		d.params.ContainerConfig.Container,
		d.params.ContainerConfig.Mounts,
		d.params.ContainerConfig.Volumes,
	); err != nil {
		log.Println("PVC deployment failed: " + err.Error())
		return err
	}

	return nil
}

func (d *deployFacade) Deploy() error {
	var portList []v1.PortBinding
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
		},
	); err != nil {
		log.Println("Error with service: " + err.Error())
		return err
	}

	if err := d.deployment.deployDeployment(&deploymentParams{
		image:           d.params.Image,
		namespace:       d.params.InstanceConfig.ContainerPreName,
		containerConfig: &d.params.ContainerConfig,
		configMapsEnv:   d.configmap.avail,
		volumes:         d.pvc.avail,
		portList:        portList,
		command:         d.params.ContainerConfig.Command,
		args:            d.params.ContainerConfig.Args,
		issuer:          d.params.Issuer,
	}); err != nil {
		log.Println("Error with deployment: " + err.Error())
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
			},
		); err != nil {
			log.Println("Error with deployment: " + err.Error())
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

func Deploy(c context.Context, dog *dogger.DeploymentLogger, deployImageRequest *v1.DeployImageRequest, versionData *v1.VersionData) error {
	dog.Write(deployImageRequest.Strings(&config.Cfg.CommonConfiguration)...)
	dog.Write(deployImageRequest.InstanceConfig.Strings()...)
	dog.Write(deployImageRequest.ContainerConfig.Strings(&config.Cfg.CommonConfiguration)...)

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
		})

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
