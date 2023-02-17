import {
  ContainerConfigData,
  ContainerConfigExposeStrategy,
  ContainerConfigLog,
  ContainerConfigVolume,
  ContainerDeploymentStrategyType,
  ContainerLogDriverType,
  ContainerNetworkMode,
  ContainerRestartPolicyType,
  VersionImage,
} from '@app/models'
import {
  DeploymentStrategy,
  deploymentStrategyFromJSON,
  deploymentStrategyToJSON,
  DriverType,
  driverTypeFromJSON,
  driverTypeToJSON,
  ExposeStrategy,
  NetworkMode,
  networkModeFromJSON,
  networkModeToJSON,
  RestartPolicy,
  restartPolicyFromJSON,
  restartPolicyToJSON,
  volumeTypeFromJSON,
  volumeTypeToJSON,
} from '@app/models/grpc/protobuf/proto/common'

import {
  CommonContainerConfig,
  CraneContainerConfig,
  DagentContainerConfig,
  ImageContainerConfig as ProtoContainerConfig,
  ImageResponse,
  LogConfig,
  Volume,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { registryTypeProtoToDto } from './registry-mappers'

export const objectHasProperties = (object: any): boolean =>
  // booleans and numbers need this type of null check
  Object.values(object).some(it => it !== null && it !== undefined)

export const networkModeToDto = (networkMode?: NetworkMode): ContainerNetworkMode =>
  !networkMode ? null : (networkModeToJSON(networkMode).toLowerCase() as ContainerNetworkMode)

export const deploymentStrategyToDto = (strategy?: DeploymentStrategy): ContainerDeploymentStrategyType => {
  if (!strategy) {
    return null
  }

  switch (strategy) {
    case DeploymentStrategy.UNRECOGNIZED:
      return 'recreate'
    default:
      return deploymentStrategyToJSON(strategy).toLowerCase() as ContainerDeploymentStrategyType
  }
}

export const restartPolicyTypeToDto = (policy: RestartPolicy): ContainerRestartPolicyType => {
  if (!policy) {
    return null
  }

  switch (policy) {
    case RestartPolicy.ON_FAILURE:
      return 'onFailure'
    case RestartPolicy.UNLESS_STOPPED:
      return 'unlessStopped'
    default:
      return restartPolicyToJSON(policy).toLowerCase() as ContainerRestartPolicyType
  }
}

export const networkModeToProto = (networkMode?: ContainerNetworkMode): NetworkMode =>
  !networkMode ? null : networkModeFromJSON(networkMode.toUpperCase())

export const restartPolicyTypeToProto = (policy?: ContainerRestartPolicyType): RestartPolicy =>
  !policy ? null : restartPolicyFromJSON(policy.toUpperCase())

export const deploymentStrategyToProto = (strategy?: ContainerDeploymentStrategyType): DeploymentStrategy =>
  !strategy ? null : deploymentStrategyFromJSON(strategy.toUpperCase())

export const logConfigToProto = (logConfig?: ContainerConfigLog): LogConfig => {
  if (!logConfig) {
    return null
  }

  return {
    driver: logConfig.driver ? driverTypeFromJSON(logConfig.driver.toUpperCase()) : DriverType.DRIVER_TYPE_NONE,
    options: logConfig.options,
  }
}

export const logDriverDto = (logDriver: DriverType): ContainerLogDriverType => {
  if (!logDriver) {
    return null
  }

  switch (logDriver) {
    case DriverType.DRIVER_TYPE_NONE:
      return 'none'
    default:
      return driverTypeToJSON(logDriver).toLowerCase() as ContainerLogDriverType
  }
}

export const logConfigToDto = (logConfig: LogConfig): ContainerConfigLog => {
  if (!logConfig) {
    return null
  }

  return {
    driver: logDriverDto(logConfig.driver),
    options: logConfig.options,
  }
}

export const volumesToProto = (volumes?: ContainerConfigVolume[]): Volume[] => {
  if (!volumes) {
    return []
  }

  return volumes.map(volume => ({ ...volume, type: volumeTypeFromJSON(volume.type.toUpperCase()) } as Volume))
}

export const volumesToDto = (volumes?: Volume[]): ContainerConfigVolume[] => {
  if (!volumes) {
    return null
  }

  return volumes.map(
    volume => ({ ...volume, type: volumeTypeToJSON(volume.type).toLowerCase() } as ContainerConfigVolume),
  )
}

export const exposeToDto = (expose: ExposeStrategy): ContainerConfigExposeStrategy => {
  if (!expose) {
    return null
  }

  switch (expose) {
    case ExposeStrategy.NONE_ES:
      return 'none'
    case ExposeStrategy.EXPOSE:
      return 'expose'
    case ExposeStrategy.EXPOSE_WITH_TLS:
      return 'exposeWithTls'
    default:
      return 'none'
  }
}

export const exposeToProto = (expose: ContainerConfigExposeStrategy): ExposeStrategy => {
  switch (expose) {
    case 'none':
      return ExposeStrategy.NONE_ES
    case 'expose':
      return ExposeStrategy.EXPOSE
    case 'exposeWithTls':
      return ExposeStrategy.EXPOSE_WITH_TLS
    default:
      return null
  }
}

export const containerConfigToDto = (config?: ProtoContainerConfig): ContainerConfigData => {
  if (!config) {
    return null
  }

  const cfg: ContainerConfigData = {
    // common
    name: config.common.name ?? null,
    user: config.common.user ?? null,
    tty: config.common.TTY ?? false,
    ingress: config.common.ingress
      ? {
          ...config.common.ingress,
          uploadLimit: config.common.ingress.uploadLimit ?? null,
        }
      : null,
    configContainer: config.common.configContainer ?? null,
    importContainer: config.common.importContainer ?? null,
    ports: config.common.ports?.data ?? null,
    portRanges: config.common.portRanges?.data ?? null,
    volumes: config.common.volumes?.data ? volumesToDto(config.common.volumes.data) : null,
    commands: config.common.commands?.data ?? null,
    args: config.common.args?.data ?? null,
    expose: exposeToDto(config.common.expose),
    environment: config.common.environment?.data ?? null,
    initContainers: config.common?.initContainers?.data ?? null,
    secrets: config.secrets?.data ?? null,
    capabilities: null,

    // dagent
    logConfig: logConfigToDto(config.dagent?.logConfig),
    restartPolicy: restartPolicyTypeToDto(config.dagent?.restartPolicy),
    networkMode: networkModeToDto(config.dagent?.networkMode),
    networks: config.dagent?.networks?.data ?? null,
    dockerLabels: config.dagent?.labels?.data ?? null,

    // crane
    deploymentStrategy: deploymentStrategyToDto(config.crane?.deploymentStatregy),
    customHeaders: config.crane?.customHeaders?.data ?? null,
    proxyHeaders: config.crane?.proxyHeaders ?? false,
    useLoadBalancer: config.crane?.useLoadBalancer ?? false,
    extraLBAnnotations: config.crane?.extraLBAnnotations?.data ?? null,
    healthCheckConfig: config.crane?.healthCheckConfig ?? null,
    resourceConfig: config.crane?.resourceConfig ?? null,
    labels: config.crane?.labels ?? null,
    annotations: config.crane?.annotations ?? null,
  }

  return cfg
}

export const containerConfigToProto = (config: Partial<ContainerConfigData>): ProtoContainerConfig => {
  if (!config) {
    return null
  }

  const common: CommonContainerConfig = {
    user: config.user ?? null,
    TTY: config.tty,
    ports: config.ports ? { data: config.ports } : null,
    portRanges: config.portRanges ? { data: config.portRanges } : null,
    volumes: config.volumes ? { data: volumesToProto(config.volumes) } : null,
    commands: config.commands ? { data: config.commands } : null,
    args: config.args ? { data: config.args } : null,
    expose: exposeToProto(config.expose),
    ingress: config.ingress ? { ...config.ingress } : null,
    configContainer: config.configContainer,
    importContainer: config.importContainer,
    name: config.name,
    environment: config.environment ? { data: config.environment } : null,
    initContainers: config.initContainers ? { data: config.initContainers } : null,
  }

  const dagent: DagentContainerConfig = {
    logConfig: logConfigToProto(config.logConfig),
    restartPolicy: restartPolicyTypeToProto(config.restartPolicy),
    networkMode: networkModeToProto(config.networkMode),
    networks: config.networks ? { data: config.networks } : null,
    labels: config.dockerLabels ? { data: config.dockerLabels } : null,
  }

  const crane: CraneContainerConfig = {
    deploymentStatregy: deploymentStrategyToProto(config.deploymentStrategy),
    healthCheckConfig: config.healthCheckConfig ?? null,
    resourceConfig: config.resourceConfig ?? null,
    customHeaders: config.customHeaders ? { data: config.customHeaders } : null,
    proxyHeaders: config.proxyHeaders,
    useLoadBalancer: config.useLoadBalancer,
    extraLBAnnotations: config.extraLBAnnotations ? { data: config.extraLBAnnotations } : null,
    annotations: config.annotations
      ? {
          deployment: config.annotations.deployment ?? [],
          service: config.annotations.service ?? [],
          ingress: config.annotations.ingress ?? [],
        }
      : null,
    labels: config.labels
      ? {
          deployment: config.labels.deployment ?? [],
          service: config.labels.service ?? [],
          ingress: config.labels.ingress ?? [],
        }
      : null,
  }

  const protoConfig: ProtoContainerConfig = {
    common: objectHasProperties(common) ? common : null,
    dagent: objectHasProperties(dagent) ? dagent : null,
    crane: objectHasProperties(crane) ? crane : null,
    secrets: config.secrets ? { data: config.secrets } : null,
  }

  return protoConfig
}

export const imageToDto = (image: ImageResponse): VersionImage => ({
  ...image,
  config: containerConfigToDto(image.config),
  createdAt: timestampToUTC(image.createdAt),
  registryType: registryTypeProtoToDto(image.registryType),
})
