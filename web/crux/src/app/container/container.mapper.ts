import { Injectable } from '@nestjs/common'
import { ContainerConfig, ContainerConfigType } from '@prisma/client'
import { ContainerConfigData } from 'src/domain/container'
import { ContainerConfigUpdatedEvent } from 'src/domain/domain-events'
import { toNullableBoolean, toNullableNumber, toPrismaJson } from 'src/domain/utils'
import { ConfigUpdatedMessage } from './container-config.message'
import { ContainerConfigDto, ContainerConfigTypeDto } from './container.dto'

@Injectable()
export default class ContainerMapper {
  typeToDto(type: ContainerConfigType): ContainerConfigTypeDto {
    switch (type) {
      case 'configBundle':
        return 'config-bundle'
      default:
        return type
    }
  }

  configDataToDto(id: string, type: ContainerConfigType, config: ContainerConfigData): ContainerConfigDto {
    if (!config) {
      return null
    }

    return {
      ...config,
      id,
      type: this.typeToDto(type),
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

  configDtoToConfigData(current: ContainerConfigData, patch: ContainerConfigDto): ContainerConfigData {
    let result: ContainerConfigData = {
      ...current,
      ...patch,
    }

    if ('storage' in patch) {
      result = {
        ...result,
        storageSet: true,
        storageId: patch.storage?.storageId ?? null,
        storageConfig: patch.storage?.storageId
          ? {
              path: patch.storage.path,
              bucket: patch.storage.bucket,
            }
          : null,
      }
    }

    if ('annotations' in patch) {
      result = {
        ...result,
        annotations: {
          ...(current.annotations ?? {}),
          ...patch.annotations,
        },
      }
    }

    if ('labels' in patch) {
      result = {
        ...result,
        labels: {
          ...(current.labels ?? {}),
          ...patch.labels,
        },
      }
    }

    return result
  }

  dbConfigToCreateConfigStatement(
    config: Omit<ContainerConfig, 'id'>,
  ): Omit<ContainerConfig, 'id' | 'updatedAt' | 'updatedBy'> {
    return {
      type: config.type,
      // common
      name: config.name ?? null,
      expose: config.expose ?? null,
      routing: toPrismaJson(config.routing),
      configContainer: toPrismaJson(config.configContainer) ?? null,
      user: toNullableNumber(config.user),
      workingDirectory: config.workingDirectory ?? null,
      tty: toNullableBoolean(config.tty),
      ports: toPrismaJson(config.ports),
      portRanges: toPrismaJson(config.portRanges),
      volumes: toPrismaJson(config.volumes),
      commands: toPrismaJson(config.commands),
      args: toPrismaJson(config.args),
      environment: toPrismaJson(config.environment),
      secrets: toPrismaJson(config.secrets),
      initContainers: toPrismaJson(config.initContainers),
      logConfig: toPrismaJson(config.logConfig),
      storageSet: toNullableBoolean(config.storageSet),
      storageId: config.storageId ?? null,
      storageConfig: toPrismaJson(config.storageConfig),

      // dagent
      restartPolicy: config.restartPolicy ?? null,
      networkMode: config.networkMode ?? null,
      networks: toPrismaJson(config.networks),
      dockerLabels: toPrismaJson(config.dockerLabels),
      expectedState: toPrismaJson(config.expectedState),

      // crane
      deploymentStrategy: config.deploymentStrategy ?? null,
      healthCheckConfig: toPrismaJson(config.healthCheckConfig),
      resourceConfig: toPrismaJson(config.resourceConfig),
      proxyHeaders: toNullableBoolean(config.proxyHeaders),
      useLoadBalancer: toNullableBoolean(config.useLoadBalancer),
      customHeaders: toPrismaJson(config.customHeaders),
      extraLBAnnotations: toPrismaJson(config.extraLBAnnotations),
      capabilities: toPrismaJson(config.capabilities),
      annotations: toPrismaJson(config.annotations),
      labels: toPrismaJson(config.labels),
      metrics: toPrismaJson(config.metrics),
    }
  }

  configDataToDbPatch(config: ContainerConfigData): ContainerConfigDbPatch {
    return {
      name: 'name' in config ? config.name ?? null : undefined,
      expose: 'expose' in config ? config.expose ?? null : undefined,
      routing: 'routing' in config ? toPrismaJson(config.routing) : undefined,
      configContainer: 'configContainer' in config ? toPrismaJson(config.configContainer) : undefined,
      user: 'user' in config ? toNullableNumber(config.user) : undefined,
      workingDirectory: 'workingDirectory' in config ? config.workingDirectory ?? null : undefined,
      tty: 'tty' in config ? toNullableBoolean(config.tty) : undefined,
      ports: 'ports' in config ? toPrismaJson(config.ports) : undefined,
      portRanges: 'portRanges' in config ? toPrismaJson(config.portRanges) : undefined,
      volumes: 'volumes' in config ? toPrismaJson(config.volumes) : undefined,
      commands: 'commands' in config ? toPrismaJson(config.commands) : undefined,
      args: 'args' in config ? toPrismaJson(config.args) : undefined,
      environment: 'environment' in config ? toPrismaJson(config.environment) : undefined,
      secrets: 'secrets' in config ? toPrismaJson(config.secrets) : undefined,
      initContainers: 'initContainers' in config ? toPrismaJson(config.initContainers) : undefined,
      logConfig: 'logConfig' in config ? toPrismaJson(config.logConfig) : undefined,
      storageSet: 'storageSet' in config ? toNullableBoolean(config.storageSet) : undefined,
      storageId: 'storageId' in config ? config.storageId ?? null : undefined,
      storageConfig: 'storageConfig' in config ? toPrismaJson(config.storageConfig) : undefined,

      // dagent
      restartPolicy: 'restartPolicy' in config ? config.restartPolicy ?? null : undefined,
      networkMode: 'networkMode' in config ? config.networkMode ?? null : undefined,
      networks: 'networks' in config ? toPrismaJson(config.networks) : undefined,
      dockerLabels: 'dockerLabels' in config ? toPrismaJson(config.dockerLabels) : undefined,
      expectedState: 'expectedState' in config ? toPrismaJson(config.expectedState) : undefined,

      // crane
      deploymentStrategy: 'deploymentStrategy' in config ? config.deploymentStrategy ?? null : undefined,
      healthCheckConfig: 'healthCheckConfig' in config ? toPrismaJson(config.healthCheckConfig) : undefined,
      resourceConfig: 'resourceConfig' in config ? toPrismaJson(config.resourceConfig) : undefined,
      proxyHeaders: 'proxyHeaders' in config ? toNullableBoolean(config.proxyHeaders) : undefined,
      useLoadBalancer: 'useLoadBalancer' in config ? toNullableBoolean(config.useLoadBalancer) : undefined,
      customHeaders: 'customHeaders' in config ? toPrismaJson(config.customHeaders) : undefined,
      extraLBAnnotations: 'extraLBAnnotations' in config ? toPrismaJson(config.extraLBAnnotations) : undefined,
      capabilities: 'capabilities' in config ? toPrismaJson(config.capabilities) : undefined,
      annotations: 'annotations' in config ? toPrismaJson(config.annotations) : undefined,
      labels: 'labels' in config ? toPrismaJson(config.labels) : undefined,
      metrics: 'metrics' in config ? toPrismaJson(config.metrics) : undefined,
    }
  }

  configUpdatedEventToMessage(event: ContainerConfigUpdatedEvent): ConfigUpdatedMessage {
    return {
      ...event.patch,
      id: event.id,
    }
  }
}

export type ContainerConfigDbPatch = Omit<ContainerConfig, 'id' | 'type' | 'updatedAt' | 'updatedBy'>
