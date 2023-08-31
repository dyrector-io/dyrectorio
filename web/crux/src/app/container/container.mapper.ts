import { Injectable } from '@nestjs/common'
import { ContainerConfig } from '@prisma/client'
import {
  ContainerConfigData,
  InstanceContainerConfigData,
  MergedContainerConfigData,
  Metrics,
  UniqueKeyValue,
  UniqueSecretKey,
  UniqueSecretKeyValue,
} from 'src/domain/container'
import { toPrismaJson } from 'src/domain/utils'
import { ContainerConfigDto, PartialContainerConfigDto, UniqueKeyValueDto } from './container.dto'

@Injectable()
export default class ContainerMapper {
  uniqueKeyValueDtoToDb(it: UniqueKeyValueDto): UniqueKeyValue {
    return it
  }

  configDataToDto(config: ContainerConfigData): ContainerConfigDto {
    return {
      ...config,
      capabilities: null,
      storage: !config.storageSet
        ? null
        : {
            storageId: config.storageId,
            bucket: config.storageConfig?.bucket,
            path: config.storageConfig?.path,
          },
    }
  }

  configDtoToConfigData(current: ContainerConfigData, patch: PartialContainerConfigDto): ContainerConfigData {
    const storagePatch =
      'storage' in patch
        ? {
            storageSet: !!patch.storage?.storageId,
            storageId: patch.storage?.storageId ?? null,
            storageConfig: patch.storage?.storageId
              ? {
                  path: patch.storage.path,
                  bucket: patch.storage.bucket,
                }
              : null,
          }
        : undefined

    return {
      ...current,
      ...patch,
      capabilities: undefined, // TODO (@m8vago, @nandor-magyar): Remove this line, when capabilites are ready
      annotations: !patch.annotations
        ? current.annotations
        : {
            ...(current.annotations ?? {}),
            ...patch.annotations,
          },
      labels: !patch.labels
        ? current.labels
        : {
            ...(current.labels ?? {}),
            ...patch.labels,
          },
      ...storagePatch,
    }
  }

  configDataToDb(config: Partial<ContainerConfigData>): Omit<ContainerConfig, 'id' | 'imageId'> {
    return {
      name: config.name,
      expose: config.expose,
      routing: toPrismaJson(config.routing),
      configContainer: toPrismaJson(config.configContainer),
      // Set user to the given value, if not null or use 0 if specifically 0, otherwise set to default -1
      user: config.user ?? (config.user === 0 ? 0 : -1),
      tty: config.tty !== null ? config.tty : false,
      ports: toPrismaJson(config.ports),
      portRanges: toPrismaJson(config.portRanges),
      volumes: toPrismaJson(config.volumes),
      commands: toPrismaJson(config.commands),
      args: toPrismaJson(config.args),
      environment: toPrismaJson(config.environment),
      secrets: toPrismaJson(config.secrets),
      initContainers: toPrismaJson(config.initContainers),
      logConfig: toPrismaJson(config.logConfig),
      storageSet: config.storageSet,
      storageId: config.storageId,
      storageConfig: toPrismaJson(config.storageConfig),

      // dagent
      restartPolicy: config.restartPolicy,
      networkMode: config.networkMode,
      networks: toPrismaJson(config.networks),
      dockerLabels: toPrismaJson(config.dockerLabels),

      // crane
      deploymentStrategy: config.deploymentStrategy,
      healthCheckConfig: toPrismaJson(config.healthCheckConfig),
      resourceConfig: toPrismaJson(config.resourceConfig),
      proxyHeaders: config.proxyHeaders !== null ? config.proxyHeaders : false,
      useLoadBalancer: config.useLoadBalancer !== null ? config.useLoadBalancer : false,
      customHeaders: toPrismaJson(config.customHeaders),
      extraLBAnnotations: toPrismaJson(config.extraLBAnnotations),
      capabilities: toPrismaJson(config.capabilities),
      annotations: toPrismaJson(config.annotations),
      labels: toPrismaJson(config.labels),
      metrics: toPrismaJson(config.metrics),
    }
  }

  mergeSecrets(instanceSecrets: UniqueSecretKeyValue[], imageSecrets: UniqueSecretKey[]): UniqueSecretKeyValue[] {
    imageSecrets = imageSecrets ?? []
    instanceSecrets = instanceSecrets ?? []

    const overriddenIds: Set<string> = new Set(instanceSecrets?.map(it => it.id))

    const missing: UniqueSecretKeyValue[] = imageSecrets
      .filter(it => !overriddenIds.has(it.id))
      .map(it => ({
        ...it,
        value: '',
        encrypted: false,
        publicKey: null,
      }))

    return [...missing, ...instanceSecrets]
  }

  mergeMetrics(instance: Metrics, image: Metrics): Metrics {
    if (!instance) {
      return image?.enabled ? image : null
    }

    return instance
  }

  mergeConfigs(image: ContainerConfigData, instance: InstanceContainerConfigData): MergedContainerConfigData {
    return {
      // common
      name: instance.name ?? image.name,
      environment: instance.environment ?? image.environment,
      secrets: this.mergeSecrets(instance.secrets, image.secrets),
      user: instance.user ?? image.user,
      tty: instance.tty ?? image.tty,
      portRanges: instance.portRanges ?? image.portRanges,
      args: instance.args ?? image.args,
      commands: instance.commands ?? image.commands,
      expose: instance.expose ?? image.expose,
      configContainer: instance.configContainer ?? image.configContainer,
      routing: instance.routing ?? image.routing,
      volumes: instance.volumes ?? image.volumes,
      initContainers: instance.initContainers ?? image.initContainers,
      capabilities: [], // TODO (@m8vago, @nandor-magyar): capabilities feature is still missing
      ports: instance.ports ?? image.ports,
      storageSet: instance.storageSet || image.storageSet,
      storageId: instance.storageSet ? instance.storageId : image.storageId,
      storageConfig: instance.storageSet ? instance.storageConfig : image.storageConfig,

      // crane
      customHeaders: instance.customHeaders ?? image.customHeaders,
      proxyHeaders: instance.proxyHeaders ?? image.proxyHeaders,
      extraLBAnnotations: instance.extraLBAnnotations ?? image.extraLBAnnotations,
      healthCheckConfig: instance.healthCheckConfig ?? image.healthCheckConfig,
      resourceConfig: instance.resourceConfig ?? image.resourceConfig,
      useLoadBalancer: instance.useLoadBalancer ?? image.useLoadBalancer,
      deploymentStrategy: instance.deploymentStrategy ?? image.deploymentStrategy,
      labels:
        instance.labels || image.labels
          ? {
              deployment: instance.labels?.deployment ?? image.labels?.deployment ?? [],
              service: instance.labels?.service ?? image.labels?.service ?? [],
              ingress: instance.labels?.ingress ?? image.labels?.ingress ?? [],
            }
          : null,
      annotations:
        image.annotations || instance.annotations
          ? {
              deployment: instance.annotations?.deployment ?? image.annotations?.deployment ?? [],
              service: instance.annotations?.service ?? image.annotations?.service ?? [],
              ingress: instance.annotations?.ingress ?? image.annotations?.ingress ?? [],
            }
          : null,
      metrics: this.mergeMetrics(instance.metrics, image.metrics),

      // dagent
      logConfig: instance.logConfig ?? image.logConfig,
      networkMode: instance.networkMode ?? image.networkMode,
      restartPolicy: instance.restartPolicy ?? image.restartPolicy,
      networks: instance.networks ?? image.networks,
      dockerLabels: instance.dockerLabels ?? image.dockerLabels,
    }
  }
}
