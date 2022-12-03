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
import { toTimestamp } from 'src/domain/utils'
import {
  DeploymentStrategy as ProtoDeploymentStrategy,
  DriverType,
  driverTypeFromJSON,
  driverTypeToJSON,
  ExposeStrategy as ProtoExposeStrategy,
  NetworkMode as ProtoNetworkMode,
  networkModeFromJSON,
  networkModeToJSON,
  RestartPolicy as ProtoRestartPolicy,
  VolumeType as ProtoVolumeType,
  volumeTypeFromJSON,
  volumeTypeToJSON,
} from 'src/grpc/protobuf/proto/common'
import {
  CommonContainerConfig as ProtoCruxCommonContainerConfig,
  ContainerConfig as ProtoContainerConfig,
  CraneContainerConfig as ProtoCruxCraneContainerConfig,
  DagentContainerConfig as ProtoCruxDagentContainerConfig,
  ImageResponse,
  LogConfig,
  UniqueSecretKeyValue as ProtoUniqueSecretKeyValue,
  Volume as ProtoVolume,
} from 'src/grpc/protobuf/proto/crux'
import { toPrismaJson } from 'src/shared/mapper'
import {
  ContainerConfigData,
  ContainerConfigLog,
  ContainerConfigVolume,
  ContainerLogDriverType,
  InstanceContainerConfigData,
  UniqueKeyValue,
  UniqueSecretKey,
  UniqueSecretKeyValue,
  VolumeType,
  XOR,
} from 'src/shared/models'

@Injectable()
export default class ImageMapper {
  toGrpc(image: ImageDetails): ImageResponse {
    return {
      ...image,
      registryName: image.registry.name,
      config: this.configToGrpc(image.config),
      createdAt: toTimestamp(image.createdAt),
    }
  }

  configToGrpc(containerConfig: ContainerConfig): ProtoContainerConfig {
    const config = containerConfig as any as ContainerConfigData

    return {
      capabilities: config.capabilities as UniqueKeyValue[],
      common: this.configToCommonConfig(config, (it: UniqueSecretKey) => ({
        ...it,
        publicKey: '',
        value: '',
      })),
      dagent: this.configToDagentConfig(config),
      crane: this.configToCraneConfig(config),
    }
  }

  configToCommonConfig(
    config: Partial<ContainerConfigData>,
    secretMapper: (secret: XOR<UniqueSecretKey, UniqueSecretKeyValue>) => ProtoUniqueSecretKeyValue,
  ): ProtoCruxCommonContainerConfig {
    return {
      name: config.name,
      environment: config.environment,
      secrets: config.secrets.map(secretMapper),
      commands: config.commands,
      expose: this.exposeStrategyToGrpc(config.expose),
      args: config.args,
      TTY: config.tty,
      configContainer: config.configContainer,
      importContainer: config.importContainer,
      ingress: config.ingress,
      initContainers: config.initContainers?.map(it => ({
        ...it,
        environment: it.environment ?? [],
        volumes: it.volumes ?? [],
        command: it.command ?? [],
        args: it.args ?? [],
      })),
      portRanges: config.portRanges,
      ports: config.ports,
      user: config.user,
      volumes: this.volumesToGrpc(config.volumes),
    }
  }

  configToDagentConfig(config: Partial<ContainerConfigData>): ProtoCruxDagentContainerConfig {
    return {
      networks: config.networks,
      logConfig: this.logConfigToProto(config.logConfig),
      networkMode: this.networkModeToProto(config.networkMode),
      restartPolicy: this.restartPolicyToProto(config.restartPolicy),
      labels: config.dockerLabels,
    }
  }

  configToCraneConfig(config: Partial<ContainerConfigData>): ProtoCruxCraneContainerConfig {
    return {
      customHeaders: config.customHeaders,
      extraLBAnnotations: config.extraLBAnnotations,
      deploymentStatregy: this.deploymentStrategyToProto(config.deploymentStrategy),
      healthCheckConfig: config.healthCheckConfig,
      proxyHeaders: config.proxyHeaders,
      useLoadBalancer: config.useLoadBalancer,
      resourceConfig: config.resourceConfig,
      labels: !config.labels
        ? null
        : {
            deployment: config.labels.deployment ?? [],
            service: config.labels.service ?? [],
            ingress: config.labels.ingress ?? [],
          },
      annotations: !config.annotations
        ? null
        : {
            deployment: config.annotations.deployment ?? [],
            service: config.annotations.service ?? [],
            ingress: config.annotations.ingress ?? [],
          },
    }
  }

  configProtoToContainerConfigData(config: ProtoContainerConfig): InstanceContainerConfigData {
    return {
      // common
      name: config.common?.name,
      expose: this.exposeStrategyToDb(config.common?.expose),
      ingress: config.common?.ingress,
      configContainer: config.common?.configContainer,
      importContainer: config.common?.importContainer,
      user: config.common?.user ? config.common.user : null,
      tty: config.common?.TTY ?? false,
      ports: config.common?.ports,
      portRanges: config.common?.portRanges,
      volumes: this.volumesToDb(config.common?.volumes ?? []),
      commands: config.common?.commands,
      args: config.common?.args,
      environment: config.common?.environment,
      secrets: config.common?.secrets,
      initContainers: config.common?.initContainers,

      // dagent
      logConfig: this.logConfigToDb(config.dagent?.logConfig),
      restartPolicy: this.restartPolicyToDb(config.dagent?.restartPolicy),
      networkMode: this.networkModeToDb(config.dagent?.networkMode),
      networks: config.dagent?.networks,
      dockerLabels: config.dagent?.labels,

      // crane
      deploymentStrategy: this.deploymentStrategyToDb(config.crane?.deploymentStatregy),
      healthCheckConfig: config.crane?.healthCheckConfig,
      resourceConfig: config.crane?.resourceConfig,
      proxyHeaders: config.crane?.proxyHeaders ?? false,
      useLoadBalancer: config.crane?.useLoadBalancer ?? false,
      customHeaders: config.crane?.customHeaders,
      extraLBAnnotations: config.crane?.extraLBAnnotations,
      capabilities: config.capabilities,
      annotations: config.crane?.annotations,
      labels: config.crane?.labels,
    }
  }

  containerConfigDataToDb(config: Partial<ContainerConfigData>): Omit<ContainerConfig, 'id' | 'imageId'> {
    return {
      name: config.name,
      expose: config.expose,
      ingress: toPrismaJson(config.ingress),
      configContainer: toPrismaJson(config.configContainer),
      importContainer: toPrismaJson(config.importContainer),
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

  dbContainerConfigToCreateImageStatement(
    config: ContainerConfig | InstanceContainerConfig,
  ): Omit<ContainerConfig, 'id' | 'imageId'> {
    return {
      // common
      name: config.name,
      expose: config.expose,
      ingress: toPrismaJson(config.ingress),
      configContainer: toPrismaJson(config.configContainer),
      importContainer: toPrismaJson(config.importContainer),
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
    switch (type) {
      case ProtoDeploymentStrategy.RECREATE:
        return DeploymentStrategy.recreate
      case ProtoDeploymentStrategy.ROLLING:
        return DeploymentStrategy.rolling
      default:
        return DeploymentStrategy.recreate
    }
  }

  exposeStrategyToGrpc(type: ExposeStrategy): ProtoExposeStrategy {
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
    return networkModeFromJSON(it?.toUpperCase())
  }

  networkModeToDb(it: ProtoNetworkMode): NetworkMode {
    if (it === ProtoNetworkMode.UNRECOGNIZED || it === ProtoNetworkMode.NETWORK_MODE_UNSPECIFIED || !it) {
      return 'bridge'
    }

    return networkModeToJSON(it).toLowerCase() as NetworkMode
  }

  logConfigToProto(logConfig?: ContainerConfigLog): LogConfig {
    if (!logConfig) {
      return null
    }

    return {
      driver: logConfig.driver ? driverTypeFromJSON(logConfig.driver.toUpperCase()) : DriverType.DRIVER_TYPE_NONE,
      options: logConfig.options,
    }
  }

  logConfigToDb(logConfig?: LogConfig): ContainerConfigLog {
    if (!logConfig) {
      return null
    }

    return {
      driver: this.logDriverToDb(logConfig.driver),
      options: logConfig.options,
    }
  }

  logDriverToDb(logDriver: DriverType): ContainerLogDriverType {
    switch (logDriver) {
      case undefined:
      case null:
      case DriverType.DRIVER_TYPE_UNSPECIFIED:
      case DriverType.DRIVER_TYPE_NONE:
        return 'none'
      default:
        return driverTypeToJSON(logDriver).toLowerCase() as ContainerLogDriverType
    }
  }

  volumesToGrpc(volumes?: ContainerConfigVolume[]): ProtoVolume[] {
    if (!volumes) {
      return []
    }

    return volumes.map(volume => ({ ...volume, type: this.volumeTypeToGrpc(volume.type) } as ProtoVolume))
  }

  volumesToDb(volumes?: ProtoVolume[]): ContainerConfigVolume[] {
    if (!volumes) {
      return []
    }

    return volumes.map(it => ({ ...it, type: this.volumeTypeToDb(it.type) } as ContainerConfigVolume))
  }

  volumeTypeToDb(it: ProtoVolumeType): VolumeType {
    switch (it) {
      case null:
      case undefined:
      case ProtoVolumeType.UNRECOGNIZED:
      case ProtoVolumeType.VOLUME_TYPE_UNSPECIFIED:
        return 'ro'
      default: {
        return volumeTypeToJSON(it).toLowerCase() as VolumeType
      }
    }
  }

  volumeTypeToGrpc(it?: VolumeType): ProtoVolumeType {
    if (!it) {
      return ProtoVolumeType.RO
    }

    return volumeTypeFromJSON(it.toUpperCase())
  }

  exposeToDb(expose?: ProtoExposeStrategy): ExposeStrategy {
    switch (expose) {
      case ProtoExposeStrategy.NONE_ES:
        return 'none'
      case ProtoExposeStrategy.EXPOSE:
        return 'expose'
      case ProtoExposeStrategy.EXPOSE_WITH_TLS:
        return 'exposeWithTls'
      default:
        return 'none'
    }
  }

  exposeToProto(expose?: ExposeStrategy): ProtoExposeStrategy {
    switch (expose) {
      case 'none':
        return ProtoExposeStrategy.NONE_ES
      case 'expose':
        return ProtoExposeStrategy.EXPOSE
      case 'exposeWithTls':
        return ProtoExposeStrategy.EXPOSE_WITH_TLS
      default:
        return null
    }
  }
}

export type ImageDetails = Image & {
  config: ContainerConfig
  registry: Registry
}
