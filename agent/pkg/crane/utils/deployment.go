package utils

import (
	"context"
	"fmt"

	"gitlab.com/dyrector_io/dyrector.io/go/internal/dogger"
	"gitlab.com/dyrector_io/dyrector.io/go/internal/util"
	v1 "gitlab.com/dyrector_io/dyrector.io/go/pkg/api/v1"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/crane/config"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/crane/k8s"
)

func DeployImage(c context.Context, dog *dogger.DeploymentLogger, deployImageRequest *v1.DeployImageRequest) (err error) {
	dog.SetRequestID(deployImageRequest.RequestID)

	dog.Write(deployImageRequest.Strings(&config.Cfg.CommonConfiguration)...)
	dog.Write(deployImageRequest.InstanceConfig.Strings()...)
	dog.Write(deployImageRequest.ContainerConfig.Strings(&config.Cfg.CommonConfiguration)...)
	runtimeConfigStr := string(deployImageRequest.RuntimeConfig)

	deployFacade := k8s.NewDeployFacade(
		&k8s.DeployFacadeParams{
			Ctx: c,
			Image: util.ImageURI{
				Host: util.GetRegistryURL(deployImageRequest.Registry, deployImageRequest.RegistryAuth),
				Name: deployImageRequest.ImageName,
				Tag:  deployImageRequest.Tag,
			},
			InstanceConfig:  deployImageRequest.InstanceConfig,
			ContainerConfig: deployImageRequest.ContainerConfig,
			RuntimeConfig:   &runtimeConfigStr,
			Issuer:          deployImageRequest.Issuer,
		})

	if err := deployFacade.CheckPreConditions(); err != nil {
		handleContextDeploymentError(dog, err)
	}

	if err := deployFacade.PreDeploy(); err != nil {
		handleContextDeploymentError(dog, err)
	}

	if err := deployFacade.Deploy(); err != nil {
		handleContextDeploymentError(dog, err)
	}

	if err := deployFacade.PostDeploy(); err != nil {
		handleContextDeploymentError(dog, err)
	}

	return nil
}

func handleContextDeploymentError(dog *dogger.DeploymentLogger, err error) {
	fmt.Println("Error:")
	dog.Write(err.Error())
}
