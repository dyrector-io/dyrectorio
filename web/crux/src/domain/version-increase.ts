import { ContainerConfig, Deployment, DeploymentStatusEnum, Image, Instance, Version } from '@prisma/client'

export type ImageWithConfig = Image & {
  config: ContainerConfig
}

type InstanceWithConfig = Instance & {
  config: ContainerConfig | null
}

type DeploymentWithInstances = Deployment & {
  config: ContainerConfig | null
  instances: InstanceWithConfig[]
}

export type IncreasableVersion = Version & {
  images: ImageWithConfig[]
  deployments: DeploymentWithInstances[]
}

type CopiedImageWithConfig = Image & {
  originalId: string
  config: Omit<ContainerConfig, 'id'>
}

type CopiedInstanceWithConfig = Omit<Instance, 'id' | 'configId' | 'deploymentId' | 'imageId'> & {
  originalImageId: string
  config: Omit<ContainerConfig, 'id'>
}

type CopiedDeploymentWithInstances = Deployment & {
  config: Omit<ContainerConfig, 'id'>
  instances: CopiedInstanceWithConfig[]
}

export type IncreasedVersion = Omit<Version, 'id' | 'createdAt' | 'createdBy' | 'projectId' | 'chainId'> & {
  images: CopiedImageWithConfig[]
  deployments: CopiedDeploymentWithInstances[]
}

const copyConfig = (config: ContainerConfig | null): Omit<ContainerConfig, 'id'> | null => {
  if (!config) {
    return null
  }

  const newConf = {
    ...config,
  }

  delete newConf.id

  return newConf
}

const copyInstance = (instance: InstanceWithConfig): CopiedInstanceWithConfig => {
  const newInstance: CopiedInstanceWithConfig = {
    originalImageId: instance.imageId,
    config: copyConfig(instance.config),
  }

  return newInstance
}

export const copyDeployment = (deployment: DeploymentWithInstances): CopiedDeploymentWithInstances => {
  const newDeployment: CopiedDeploymentWithInstances = {
    ...deployment,
    // default status for deployments is preparing
    status: DeploymentStatusEnum.preparing,
    config: copyConfig(deployment.config),
    tries: 0,
    instances: [],
    createdAt: undefined,
    createdBy: undefined,
    updatedAt: undefined,
    updatedBy: undefined,
  }

  deployment.instances.forEach(instance => {
    const newInstance = copyInstance(instance)

    newDeployment.instances.push(newInstance)
  })

  return newDeployment
}

const copyImage = (image: ImageWithConfig): CopiedImageWithConfig => {
  const config = copyConfig(image.config)

  const newImage: CopiedImageWithConfig = {
    ...image,
    originalId: image.id,
    config,
  }

  return newImage
}

export const increaseIncrementalVersion = (
  parentVersion: IncreasableVersion,
  name: string,
  changelog: string,
): IncreasedVersion => {
  const newVersion: IncreasedVersion = {
    name,
    changelog,
    default: false,
    type: parentVersion.type,
    autoCopyDeployments: parentVersion.autoCopyDeployments,
    images: [],
    deployments: [],
    updatedAt: undefined,
    updatedBy: undefined,
  }

  // copy images
  parentVersion.images.forEach(image => {
    const newImage = copyImage(image)

    newVersion.images.push(newImage)
  })

  if (parentVersion.autoCopyDeployments) {
    // copy deployments
    parentVersion.deployments.forEach(deployment => {
      const newDeployment = copyDeployment(deployment)

      newVersion.deployments.push(newDeployment)
    })
  }

  return newVersion
}
