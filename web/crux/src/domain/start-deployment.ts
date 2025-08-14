import { Deployment, DeploymentStatusEnum, VersionTypeEnum } from '@prisma/client'
import {
  ConcreteContainerConfigData,
  ContainerConfigData,
  ContainerConfigDataWithId,
  UniqueSecretKeyValue,
  containerNameOfInstance,
} from './container'
import {
  mergeConfigsWithConcreteConfig,
  mergeDeploymentConfigWithImageConfig,
  mergeInstanceConfigWithDeploymentConfig,
} from './container-merge'
import { DeploymentWithConfig } from './deployment'
import { ImageWithRegistry } from './image'

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

  const requiredSecrets = config.secrets.filter(it => it.required || (it.value && it.value.length > 0))
  const missingSecrets = requiredSecrets.filter(it => !it.encrypted)

  if (missingSecrets.length < 1) {
    return null
  }

  return {
    configId,
    secretKeys: missingSecrets.map(it => it.key),
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

export type DeployableConfigBundle = {
  config: ContainerConfigDataWithId
}

export type DeployableImage = ImageWithRegistry & {
  config: ContainerConfigData
}

export type DeployableInstance = {
  id: string
  image: DeployableImage
  configId: string
  config: ConcreteContainerConfigData
}

export type DeployableDeployment = Deployment & {
  version: {
    name: string
    type: VersionTypeEnum
  }
  nodeId: string
  status: DeploymentStatusEnum
  config: ConcreteContainerConfigData
  configBundles: {
    configBundle: DeployableConfigBundle
  }[]
  instances: DeployableInstance[]
}
export const deploymentConfigOf = (deployment: DeployableDeployment): ConcreteContainerConfigData => {
  if (
    deployment.version.type !== 'rolling' &&
    (deployment.status === 'successful' || deployment.status === 'obsolete')
  ) {
    // this is a redeployment of a successful or an obsolete deployment of an incremental version
    // we should not merge and use only the concrete configs

    return deployment.config
  }

  const configBundles = deployment.configBundles.map(it => it.configBundle.config)
  const deploymentConfig = deployment.config
  return mergeConfigsWithConcreteConfig(configBundles, deploymentConfig)
}

export const instanceConfigOf = (
  deployment: DeployableDeployment,
  instance: DeployableInstance,
): ConcreteContainerConfigData => {
  if (
    deployment.version.type !== 'rolling' &&
    (deployment.status === 'successful' || deployment.status === 'obsolete')
  ) {
    // this is a redeployment of a successful or an obsolete deployment of an incremental version
    // we should not merge and use only the concrete configs
    // TODO (@m8vago): we might not need to save the configs on success, but when incrementing

    return instance.config
  }

  // first we merge the deployment config with the image config to resolve secrets globally
  const mergedDeploymentConfig = mergeDeploymentConfigWithImageConfig(deployment.config, instance.image.config)

  // then we merge and override the rest with the instance config
  const result = mergeInstanceConfigWithDeploymentConfig(instance.config, mergedDeploymentConfig)

  // set defaults
  if (!result.name) {
    result.name = containerNameOfInstance(instance)
  }

  return result
}

type SecretCandidate = {
  deployedAt: Date
  value: string
}

export const mergePrefixNeighborSecrets = (
  deployments: DeploymentWithConfig[],
  currentSecrets: UniqueSecretKeyValue[],
  publicKey: string,
): Record<string, string> => {
  const result = new Map<string, SecretCandidate>()

  deployments
    .sort((one, other) => other.createdAt.getTime() - one.createdAt.getTime())
    .forEach(depl => {
      if (!depl.config.secrets) {
        return
      }

      const secrets = depl.config.secrets as UniqueSecretKeyValue[]
      secrets.forEach(it => {
        if (it.publicKey !== publicKey) {
          return
        }

        const candidate = result.get(it.key)
        if (candidate && candidate.deployedAt.getTime() > depl.deployedAt.getTime()) {
          // when there is already a deployment for the key, and it's the more recent one
          return
        }

        result.set(it.key, {
          deployedAt: depl.deployedAt,
          value: it.value,
        })
      })
    })

  currentSecrets.forEach(it => {
    result.set(it.key, {
      value: it.value,
      deployedAt: null,
    })
  })

  const entries = [...result.entries()].map(entry => {
    const [key, candidate] = entry
    return [key, candidate.value]
  })

  return Object.fromEntries(entries)
}
