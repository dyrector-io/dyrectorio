import { Injectable } from '@nestjs/common'
import { ContainerConfig } from '@prisma/client'
import {
  ContainerConfigData,
  InstanceContainerConfigData,
  MergedContainerConfigData,
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
      ingress: toPrismaJson(config.ingress),
      configContainer: toPrismaJson(config.configContainer),
      user: config.user ? config.user : null,
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
      ingress: instance.ingress ?? image.ingress,
      volumes: instance.volumes ?? image.volumes,
      initContainers: instance.initContainers ?? image.initContainers,
      capabilities: [], // TODO (@m8vago, @nandor-magyar): caps
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

      // dagent
      logConfig: instance.logConfig ?? image.logConfig,
      networkMode: instance.networkMode ?? image.networkMode,
      restartPolicy: instance.restartPolicy ?? image.restartPolicy,
      networks: instance.networks ?? image.networks,
      dockerLabels: instance.dockerLabels ?? image.dockerLabels,
    }
  }
}
