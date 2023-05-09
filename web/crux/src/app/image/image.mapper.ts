import { Injectable } from '@nestjs/common'
import {
  ContainerConfig,
  DeploymentStrategy,
  ExposeStrategy,
  Image,
  InstanceContainerConfig,
  NetworkMode,
  Registry,
  RestartPolicy,
} from '@prisma/client'
import { ContainerConfigData, ContainerLogDriverType, ContainerVolumeType, Volume } from 'src/domain/container'
import { Volume as ProtoVolume } from 'src/grpc/protobuf/proto/agent'
import {
  DriverType,
  DeploymentStrategy as ProtoDeploymentStrategy,
  ExposeStrategy as ProtoExposeStrategy,
  NetworkMode as ProtoNetworkMode,
  RestartPolicy as ProtoRestartPolicy,
  VolumeType as ProtoVolumeType,
  driverTypeFromJSON,
  networkModeFromJSON,
  networkModeToJSON,
  volumeTypeFromJSON,
} from 'src/grpc/protobuf/proto/common'
import { toPrismaJson } from 'src/domain/utils'
import ContainerMapper from '../container/container.mapper'
import RegistryMapper from '../registry/registry.mapper'
import { ImageDto } from './image.dto'

@Injectable()
export default class ImageMapper {
  constructor(private registryMapper: RegistryMapper, private readonly containerMapper: ContainerMapper) {}

  toDto(it: ImageDetails): ImageDto {
    return {
      id: it.id,
      name: it.name,
      tag: it.tag,
      order: it.order,
      registry: this.registryMapper.toDto(it.registry),
      config: this.containerMapper.configDataToDto(it.config as any as ContainerConfigData),
      createdAt: it.createdAt,
    }
  }

  dbContainerConfigToCreateImageStatement(
    config: ContainerConfig | InstanceContainerConfig,
  ): Omit<ContainerConfig, 'id' | 'imageId'> {
    return {
      // common
      name: config.name,
      expose: config.expose,
      ingress: toPrismaJson(config.ingress),
      configContainer: toPrismaJson(config.configContainer),
      user: config.user ? config.user : null,
      tty: config.tty ?? false,
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
      proxyHeaders: config.proxyHeaders ?? false,
      useLoadBalancer: config.useLoadBalancer ?? false,
      customHeaders: toPrismaJson(config.customHeaders),
      extraLBAnnotations: toPrismaJson(config.extraLBAnnotations),
      capabilities: toPrismaJson(config.capabilities),
      annotations: toPrismaJson(config.annotations),
      labels: toPrismaJson(config.labels),
    }
  }

  deploymentStrategyToProto(type: DeploymentStrategy): ProtoDeploymentStrategy {
    if (!type) {
      return null
    }

    switch (type) {
      case DeploymentStrategy.recreate:
        return ProtoDeploymentStrategy.RECREATE
      case DeploymentStrategy.rolling:
        return ProtoDeploymentStrategy.ROLLING
      default:
        return ProtoDeploymentStrategy.DEPLOYMENT_STRATEGY_UNSPECIFIED
    }
  }

  deploymentStrategyToDb(type: ProtoDeploymentStrategy): DeploymentStrategy {
    if (!type) {
      return undefined
    }

    switch (type) {
      case ProtoDeploymentStrategy.RECREATE:
        return DeploymentStrategy.recreate
      case ProtoDeploymentStrategy.ROLLING:
        return DeploymentStrategy.rolling
      default:
        return DeploymentStrategy.recreate
    }
  }

  exposeStrategyToProto(type: ExposeStrategy): ProtoExposeStrategy {
    if (!type) {
      return null
    }

    switch (type) {
      case ExposeStrategy.expose:
        return ProtoExposeStrategy.EXPOSE
      case ExposeStrategy.exposeWithTls:
        return ProtoExposeStrategy.EXPOSE_WITH_TLS
      default:
        return ProtoExposeStrategy.NONE_ES
    }
  }

  exposeStrategyToDb(type: ProtoExposeStrategy): ExposeStrategy {
    if (!type) {
      return undefined
    }

    switch (type) {
      case ProtoExposeStrategy.EXPOSE:
        return ExposeStrategy.expose
      case ProtoExposeStrategy.EXPOSE_WITH_TLS:
        return ExposeStrategy.exposeWithTls
      default:
        return ExposeStrategy.none
    }
  }

  restartPolicyToProto(type: RestartPolicy): ProtoRestartPolicy {
    if (!type) {
      return null
    }

    switch (type) {
      case RestartPolicy.always:
        return ProtoRestartPolicy.ALWAYS
      case RestartPolicy.no:
        return ProtoRestartPolicy.NO
      case RestartPolicy.unlessStopped:
        return ProtoRestartPolicy.UNLESS_STOPPED
      case RestartPolicy.onFailure:
        return ProtoRestartPolicy.ON_FAILURE
      default:
        return ProtoRestartPolicy.NO
    }
  }

  restartPolicyToDb(type: ProtoRestartPolicy): RestartPolicy {
    if (!type) {
      return undefined
    }

    switch (type) {
      case ProtoRestartPolicy.ALWAYS:
        return RestartPolicy.always
      case ProtoRestartPolicy.NO:
        return RestartPolicy.no
      case ProtoRestartPolicy.UNLESS_STOPPED:
        return RestartPolicy.unlessStopped
      case ProtoRestartPolicy.ON_FAILURE:
        return RestartPolicy.onFailure
      default:
        return RestartPolicy.no
    }
  }

  networkModeToProto(it: NetworkMode): ProtoNetworkMode {
    if (!it) {
      return null
    }

    return networkModeFromJSON(it?.toUpperCase())
  }

  networkModeToDb(it: ProtoNetworkMode): NetworkMode {
    if (!it) {
      return undefined
    }

    if (ProtoNetworkMode.UNRECOGNIZED || ProtoNetworkMode.NETWORK_MODE_UNSPECIFIED) {
      return 'bridge'
    }

    return networkModeToJSON(it).toLowerCase() as NetworkMode
  }

  logDriverToProto(it: ContainerLogDriverType): DriverType {
    switch (it) {
      case undefined:
      case null:
      case 'none':
        return DriverType.DRIVER_TYPE_NONE
      case 'json-file':
        return DriverType.JSON_FILE
      default:
        return driverTypeFromJSON(it.toUpperCase())
    }
  }

  volumesToProto(volumes: Volume[]): ProtoVolume[] {
    if (!volumes) {
      return null
    }

    return volumes.map(it => ({ ...it, type: this.volumeTypeToProto(it.type) }))
  }

  volumeTypeToProto(it?: ContainerVolumeType): ProtoVolumeType {
    if (!it) {
      return ProtoVolumeType.RO
    }

    return volumeTypeFromJSON(it.toUpperCase())
  }
}

export type ImageDetails = Image & {
  config: ContainerConfig
  registry: Registry
}
