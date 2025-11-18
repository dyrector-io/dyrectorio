import { ContainerConfig, Deployment, DeploymentStatusEnum, Image, Instance, Version } from '@prisma/client'

export type ImageWithConfig = Image & {
  config: ContainerConfig
}

type InstanceWithConfig = Instance & {
  config: ContainerConfig | null
}

type DeploymentOnConfigBundle = {
  configBundleId: string
}

type DeploymentWithInstances = Deployment & {
  config: ContainerConfig | null
  configBundles: DeploymentOnConfigBundle[]
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

export type CopiedDeployment = Omit<Deployment, 'id' | 'configId' | 'versionId'> & {
  config: Omit<ContainerConfig, 'id'>
  configBundles: DeploymentOnConfigBundle[]
  instances: CopiedInstanceWithConfig[]
}

export type IncreasedVersion = Omit<Version, 'id' | 'createdAt' | 'createdBy' | 'projectId' | 'chainId'> & {
  images: CopiedImageWithConfig[]
  deployments: CopiedDeployment[]
}

export type CreateDeploymentStatement = Omit<
  Deployment,
  | 'id'
  | 'nodeId'
  | 'versionId'
  | 'configId'
  | 'updatedAt'
  | 'updatedBy'
  | 'createdAt'
  | 'createdBy'
  | 'deployedAt'
  | 'deployedBy'
> & {
  config: Omit<ContainerConfig, 'id' | 'type' | 'updatedAt' | 'updatedBy'>
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

const copyConfigBundleRelation = (bundle: DeploymentOnConfigBundle): DeploymentOnConfigBundle => ({
  configBundleId: bundle.configBundleId,
})

export const copyDeployment = (deployment: DeploymentWithInstances): CopiedDeployment => {
  const newDeployment: CopiedDeployment = {
    prefix: deployment.prefix,
    nodeId: deployment.nodeId,
    note: deployment.note,
    protected: deployment.protected,
    configBundles: deployment.configBundles.map(it => copyConfigBundleRelation(it)),
    // default status for deployments is preparing
    status: DeploymentStatusEnum.preparing,
    config: copyConfig(deployment.config),
    tries: 0,
    instances: [],
    deployedAt: undefined,
    deployedBy: undefined,
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
