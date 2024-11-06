import { ContainerConfig, DeploymentStatusEnum, VersionTypeEnum } from '@prisma/client'
import { ConcreteContainerConfigData, ContainerConfigData, UniqueSecretKeyValue } from './container'
import { mergeConfigsWithConcreteConfig, mergeInstanceConfigWithDeploymentConfig } from './container-merge'

export type InvalidSecrets = {
  configId: string
  invalid: string[]
  secrets: UniqueSecretKeyValue[]
}

export type MissingSecrets = {
  configId: string
  secretKeys: string[]
}

export const missingSecretsOf = (configId: string, config: ConcreteContainerConfigData): MissingSecrets | null => {
  if (!config?.secrets) {
    return null
  }

  const requiredAndMissingSecrets = config.secrets.filter(it => it.required && it.encrypted && it.value.length > 0)
  if (requiredAndMissingSecrets.length < 1) {
    return null
  }

  return {
    configId,
    secretKeys: requiredAndMissingSecrets.map(it => it.key),
  }
}

export const collectInvalidSecrets = (
  configId: string,
  config: ConcreteContainerConfigData,
  publicKey: string,
): InvalidSecrets => {
  if (!config?.secrets) {
    return null
  }

  const secrets = config.secrets as UniqueSecretKeyValue[]
  const invalid = secrets.filter(it => it.publicKey !== publicKey).map(secret => secret.id)

  if (invalid.length < 1) {
    return null
  }

  return {
    configId,
    invalid,
    secrets: secrets.map(secret => {
      if (!invalid.includes(secret.id)) {
        return secret
      }

      return {
        ...secret,
        value: '',
        encrypted: false,
        publicKey,
      }
    }),
  }
}

type DeployableDeployment = {
  version: {
    type: VersionTypeEnum
  }
  status: DeploymentStatusEnum
  config: ContainerConfig
  configBundles: {
    configBundle: {
      config: ContainerConfig
    }
  }[]
}
export const deploymentConfigOf = (deployment: DeployableDeployment): ConcreteContainerConfigData => {
  if (
    deployment.version.type !== 'rolling' &&
    (deployment.status === 'successful' || deployment.status === 'obsolete')
  ) {
    // this is a redeployment of a successful or an obsolete deployment of an incremental version
    // we should not merge and use only the concrete configs

    return deployment.config as any as ConcreteContainerConfigData
  }

  const configBundles = deployment.configBundles.map(it => it.configBundle.config as any as ContainerConfigData)
  const deploymentConfig = deployment.config as any as ConcreteContainerConfigData
  return mergeConfigsWithConcreteConfig(configBundles, deploymentConfig)
}

type DeployableInstance = {
  image: {
    config: ContainerConfig
  }
  config: ContainerConfig
}
export const instanceConfigOf = (
  deployment: DeployableDeployment,
  deploymentConfig: ConcreteContainerConfigData,
  instance: DeployableInstance,
): ConcreteContainerConfigData => {
  if (
    deployment.version.type !== 'rolling' &&
    (deployment.status === 'successful' || deployment.status === 'obsolete')
  ) {
    // this is a redeployment of a successful or an obsolete deployment of an incremental version
    // we should not merge and use only the concrete configs

    return instance.config as any as ConcreteContainerConfigData
  }

  // first we merge the deployment config with the image config to resolve secrets globally
  const imageConfig = instance.image.config as any as ContainerConfigData
  const mergedDeploymentConfig = mergeConfigsWithConcreteConfig([imageConfig], deploymentConfig)

  // then we merge and override the rest with the instance config
  const instanceConfig = instance.config as any as ConcreteContainerConfigData
  return mergeInstanceConfigWithDeploymentConfig(mergedDeploymentConfig, instanceConfig)
}
