import {
  ContainerConfig,
  Deployment,
  DeploymentStatusEnum,
  Image,
  Instance,
  InstanceContainerConfig,
  Version,
} from '@prisma/client'

export type ImageWithConfig = Image & {
  config: ContainerConfig
}

type InstanceWithConfig = Instance & {
  config: InstanceContainerConfig | null
}

type DeploymentWithInstances = Deployment & {
  instances: InstanceWithConfig[]
}

export type IncreasableVersion = Version & {
  images: ImageWithConfig[]
  deployments: DeploymentWithInstances[]
}

type CopiedImageWithConfig = Omit<Image, 'id' | 'versionId' | 'createdAt' | 'createdBy'> & {
  originalId: string
  config: Omit<ContainerConfig, 'id' | 'imageId'>
}

type CopiedInstanceWithConfig = Omit<Instance, 'id' | 'deploymentId' | 'imageId'> & {
  originalImageId: string
  config: Omit<InstanceContainerConfig, 'id' | 'instanceId'>
}

type CopiedDeploymentWithInstances = Omit<Deployment, 'id' | 'versionId' | 'createdAt' | 'createdBy'> & {
  instances: CopiedInstanceWithConfig[]
}

export type IncreasedVersion = Omit<Version, 'id' | 'createdAt' | 'createdBy' | 'projectId'> & {
  images: CopiedImageWithConfig[]
  deployments: CopiedDeploymentWithInstances[]
}

const copyInstance = (instance: InstanceWithConfig): CopiedInstanceWithConfig => {
  const newInstance: CopiedInstanceWithConfig = {
    originalImageId: instance.imageId,
    updatedAt: undefined,
    config: null,
  }

  if (instance.config) {
    const config = {
      ...instance.config,
    }

    delete config.id
    delete config.instanceId

    newInstance.config = config
  }

  return newInstance
}

export const copyDeployment = (deployment: DeploymentWithInstances): CopiedDeploymentWithInstances => {
  const newDeployment: CopiedDeploymentWithInstances = {
    note: deployment.note,
    prefix: deployment.prefix,
    // default status for deployments is preparing
    status: DeploymentStatusEnum.preparing,
    environment: deployment.environment ?? [],
    nodeId: deployment.nodeId,
    protected: deployment.protected,
    tries: 0,
    instances: [],
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
  const config = {
    ...image.config,
  }

  delete config.id
  delete config.imageId

  const newImage: CopiedImageWithConfig = {
    originalId: image.id,
    name: image.name,
    tag: image.tag,
    order: image.order,
    registryId: image.registryId,
    labels: image.labels,
    config,
    updatedAt: undefined,
    updatedBy: undefined,
  }

  return newImage
}

export const increaseIncrementalVersion = (
  parentVersion: IncreasableVersion,
  name: string,
  changelog: string,
): IncreasedVersion => {
  const newVersion: IncreasedVersion = {
    chainId: parentVersion.chainId,
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
