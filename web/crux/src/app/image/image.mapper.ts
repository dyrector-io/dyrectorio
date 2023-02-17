import { Injectable } from '@nestjs/common'
import {
  ContainerConfig,
  DeploymentStrategy,
  ExposeStrategy,
  Image,
  InstanceContainerConfig,
  NetworkMode,
  Prisma,
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
  CommonContainerConfig as ProtoCommonContainerConfig,
  CraneContainerConfig as ProtoCraneContainerConfig,
  DagentContainerConfig as ProtoDagentContainerConfig,
  ImageContainerConfig as ProtoImageContainerConfig,
  ImageResponse,
  LogConfig,
  UniqueSecretKey as ProtoUniqueSecretKey,
  Volume as ProtoVolume,
} from 'src/grpc/protobuf/proto/crux'
import { toPrismaJson } from 'src/shared/mapper'
import {
  ContainerConfigData,
  ContainerConfigLog,
  ContainerConfigVolume,
  ContainerLogDriverType,
  CONTAINER_CONFIG_JSON_FIELDS,
  UniqueSecretKey,
  VolumeType,
} from 'src/shared/models'
import RegistryMapper from '../registry/registry.mapper'

@Injectable()
export default class ImageMapper {
  constructor(private registryMapper: RegistryMapper) {}

  detailsToProto(image: ImageDetails): ImageResponse {
    return {
      ...image,
      registryName: image.registry.name,
      config: this.configToProto(image.config),
      createdAt: toTimestamp(image.createdAt),
      registryType: this.registryMapper.typeToProto(image.registry.type),
    }
  }

  configToProto(containerConfig: ContainerConfig): ProtoImageContainerConfig {
    const config = containerConfig as any as ContainerConfigData

    return {
      common: this.commonConfigToProto(config),
      dagent: this.dagentConfigToProto(config),
      crane: this.craneConfigToProto(config),
      secrets: !config.secrets
        ? null
        : {
            data: config.secrets.map(it => this.secretToProto(it)),
          },
    }
  }

  commonConfigToProto(config: Partial<ContainerConfigData>): ProtoCommonContainerConfig {
    return {
      name: config.name,
      environment: !config.environment ? null : { data: config.environment },
      commands: !config.commands ? null : { data: config.commands },
      expose: this.exposeStrategyToProto(config.expose),
      args: !config.args ? null : { data: config.args },
      TTY: config.tty,
      configContainer: config.configContainer,
      importContainer: config.importContainer,
      ingress: config.ingress,
      initContainers: !config.initContainers ? null : { data: config.initContainers },
      portRanges: !config.portRanges ? null : { data: config.portRanges },
      ports: !config.ports ? null : { data: config.ports },
      user: config.user,
      volumes: !config.volumes
        ? null
        : {
            data: config.volumes.map(
              volume => ({ ...volume, type: this.volumeTypeToProto(volume.type) } as ProtoVolume),
            ),
          },
    }
  }

  dagentConfigToProto(config: Partial<ContainerConfigData>): ProtoDagentContainerConfig {
    return {
      networks: config.networks ? { data: config.networks } : null,
      logConfig: this.logConfigToProto(config.logConfig),
      networkMode: this.networkModeToProto(config.networkMode),
      restartPolicy: this.restartPolicyToProto(config.restartPolicy),
      labels: config.dockerLabels ? { data: config.dockerLabels } : null,
    }
  }

  craneConfigToProto(config: Partial<ContainerConfigData>): ProtoCraneContainerConfig {
    return {
      customHeaders: !config.customHeaders ? null : { data: config.customHeaders },
      extraLBAnnotations: !config.extraLBAnnotations ? null : { data: config.extraLBAnnotations },
      deploymentStatregy: this.deploymentStrategyToProto(config.deploymentStrategy),
      healthCheckConfig: config.healthCheckConfig,
      proxyHeaders: config.proxyHeaders,
      useLoadBalancer: config.useLoadBalancer,
      resourceConfig: !config.resourceConfig
        ? null
        : {
            limits: config.resourceConfig.limits,
            requests: config.resourceConfig.requests,
          },
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

  configSectionResetToDb(config: Partial<ContainerConfigData>, section: string) {
    if (CONTAINER_CONFIG_JSON_FIELDS.includes(section)) {
      config[section] = Prisma.JsonNull
    } else {
      config[section] = null
    }

    return config
  }

  configProtoToContainerConfigData(
    currentConfig: Pick<ContainerConfigData, 'annotations' | 'labels'>,
    config: ProtoImageContainerConfig,
  ): Partial<ContainerConfigData> {
    return {
      // common
      name: config.common?.name,
      expose: this.exposeStrategyToDb(config.common?.expose),
      ingress: config.common?.ingress,
      configContainer: config.common?.configContainer,
      importContainer: config.common?.importContainer,
      user: config.common?.user,
      tty: this.toUndefinedAwareBoolean(config.common?.TTY),
      ports: config.common?.ports?.data,
      portRanges: config.common?.portRanges?.data,
      volumes: this.volumesToDb(config.common?.volumes?.data),
      commands: config.common?.commands?.data,
      args: config.common?.args?.data,
      environment: config.common?.environment?.data,
      secrets: config?.secrets?.data?.map(it => this.secretToDb(it)),
      initContainers: config.common?.initContainers?.data,

      // dagent
      logConfig: this.logConfigToDb(config.dagent?.logConfig),
      restartPolicy: this.restartPolicyToDb(config.dagent?.restartPolicy),
      networkMode: this.networkModeToDb(config.dagent?.networkMode),
      networks: config.dagent?.networks?.data,
      dockerLabels: config.dagent?.labels?.data,

      // crane
      deploymentStrategy: this.deploymentStrategyToDb(config.crane?.deploymentStatregy),
      healthCheckConfig: config.crane?.healthCheckConfig,
      resourceConfig: config.crane?.resourceConfig,
      proxyHeaders: this.toUndefinedAwareBoolean(config.crane?.proxyHeaders),
      useLoadBalancer: this.toUndefinedAwareBoolean(config.crane?.useLoadBalancer),
      customHeaders: config.crane?.customHeaders?.data,
      extraLBAnnotations: config.crane?.extraLBAnnotations?.data,
      capabilities: undefined, // TODO (@m8vago, @nandor-magyar): capabilities
      annotations: !config.crane?.annotations
        ? undefined
        : {
            ...(currentConfig.annotations ?? {}),
            ...config.crane.annotations,
          },
      labels: !config.crane?.labels
        ? undefined
        : {
            ...(currentConfig.labels ?? {}),
            ...config.crane.labels,
          },
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
      tty: config.tty,
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
      return undefined
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
      case DriverType.JSON_FILE:
        return 'json-file'
      default:
        return driverTypeToJSON(logDriver).toLowerCase() as ContainerLogDriverType
    }
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

  volumesToDb(volumes?: ProtoVolume[]): ContainerConfigVolume[] {
    if (!volumes) {
      return undefined
    }

    return volumes.map(it => ({ ...it, type: this.volumeTypeToDb(it.type) } as ContainerConfigVolume))
  }

  volumesToProto(volumes: ContainerConfigVolume[]): ProtoVolume[] {
    if (!volumes) {
      return null
    }

    return volumes.map(it => ({ ...it, type: this.volumeTypeToProto(it.type) }))
  }

  volumeTypeToDb(it: ProtoVolumeType): VolumeType {
    switch (it) {
      case null:
      case undefined:
      case ProtoVolumeType.UNRECOGNIZED:
      case ProtoVolumeType.VOLUME_TYPE_UNSPECIFIED:
        return 'rwo'
      default: {
        return volumeTypeToJSON(it).toLowerCase() as VolumeType
      }
    }
  }

  volumeTypeToProto(it?: VolumeType): ProtoVolumeType {
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

  secretToDb(secret: ProtoUniqueSecretKey): UniqueSecretKey {
    return {
      id: secret.id,
      key: secret.key,
      required: secret.required,
    }
  }

  secretToProto(secret: UniqueSecretKey): ProtoUniqueSecretKey {
    return {
      ...secret,
    }
  }

  toUndefinedAwareBoolean(it: boolean): boolean {
    if (it === true || it === false) {
      return it
    }

    return undefined
  }
}

export type ImageDetails = Image & {
  config: ContainerConfig
  registry: Registry
}
