import {
  ContainerConfig,
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
  ContainerConfig as ProtoContainerConfig,
  ImageResponse,
  InitContainer,
  LogConfig,
  Volume,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'

export const networkModeToDto = (networkMode?: NetworkMode): ContainerNetworkMode =>
  !networkMode ? 'bridge' : (networkModeToJSON(networkMode).toLocaleLowerCase() as ContainerNetworkMode)

export const deploymentStrategyToDto = (strategy?: DeploymentStrategy): ContainerDeploymentStrategyType => {
  switch (strategy) {
    case null:
    case undefined:
      return 'recreate'
    case DeploymentStrategy.DEPLOYMENT_STRATEGY_UNSPECIFIED:
      return 'unknown'
    default:
      return deploymentStrategyToJSON(strategy).toLocaleLowerCase() as ContainerDeploymentStrategyType
  }
}

export const restartPolicyTypeToDto = (policy?: RestartPolicy): ContainerRestartPolicyType => {
  if (!policy) {
    return 'unlessStopped'
  }

  switch (policy) {
    case RestartPolicy.ON_FAILURE:
      return 'onFailure'
    case RestartPolicy.UNLESS_STOPPED:
      return 'unlessStopped'
    default:
      return restartPolicyToJSON(policy).toLocaleLowerCase() as ContainerRestartPolicyType
  }
}

export const networkModeToProto = (networkMode?: ContainerNetworkMode): NetworkMode =>
  !networkMode ? undefined : networkModeFromJSON(networkMode.toUpperCase())

export const restartPolicyTypeToProto = (policy?: ContainerRestartPolicyType): RestartPolicy =>
  !policy ? undefined : restartPolicyFromJSON(policy.toUpperCase())

export const deploymentStrategyToProto = (strategy?: ContainerDeploymentStrategyType): DeploymentStrategy =>
  !strategy ? undefined : deploymentStrategyFromJSON(strategy.toUpperCase())

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
  switch (logDriver) {
    case undefined:
    case null:
    case DriverType.DRIVER_TYPE_UNSPECIFIED:
    case DriverType.DRIVER_TYPE_NONE:
      return 'none'
    default:
      return driverTypeToJSON(logDriver).toLocaleLowerCase() as ContainerLogDriverType
  }
}

export const logConfigToDto = (logConfig?: LogConfig): ContainerConfigLog => {
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
    return []
  }

  return volumes.map(
    volume => ({ ...volume, type: volumeTypeToJSON(volume.type).toLocaleLowerCase() } as ContainerConfigVolume),
  )
}

export const exposeToDto = (expose?: ExposeStrategy): ContainerConfigExposeStrategy => {
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

export const exposeToProto = (expose?: ContainerConfigExposeStrategy): ExposeStrategy => {
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

export const containerConfigToDto = (config?: ProtoContainerConfig): ContainerConfig => {
  if (!config) {
    return null
  }

  const cfg: ContainerConfig = {
    // common
    name: config.common.name ?? null,
    user: config.common.user ?? null,
    tty: config.common.TTY ?? false,
    ingress: config.common.ingress ?? null,
    configContainer: config.common.configContainer ?? null,
    importContainer: config.common.importContainer ?? null,
    ports: config.common.ports ?? [],
    portRanges: config.common.portRanges ?? [],
    volumes: volumesToDto(config.common.volumes),
    commands: config.common.commands ?? [],
    args: config.common.args ?? [],
    expose: exposeToDto(config.common.expose),
    environment: config.common.environment ?? [],
    initContainers: config.common?.initContainers ?? [],
    secrets: config.common.secrets ?? [],
    capabilities: config.capabilities,

    // dagent
    logConfig: logConfigToDto(config.dagent?.logConfig),
    restartPolicy: restartPolicyTypeToDto(config.dagent?.restartPolicy),
    networkMode: networkModeToDto(config.dagent?.networkMode),
    networks: config.dagent?.networks ?? [],
    dockerLabels: config.dagent?.labels ?? [],

    // crane
    deploymentStrategy: deploymentStrategyToDto(config.crane?.deploymentStatregy),
    customHeaders: config.crane?.customHeaders ?? [],
    proxyHeaders: config.crane?.proxyHeaders ?? false,
    useLoadBalancer: config.crane?.useLoadBalancer ?? false,
    extraLBAnnotations: config.crane?.extraLBAnnotations ?? null,
    healthCheckConfig: config.crane?.healthCheckConfig ?? null,
    resourceConfig: config.crane?.resourceConfig ?? null,
    labels: config.crane?.labels ?? null,
    annotations: config.crane?.annotations ?? null,
  }

  return cfg
}

export const containerConfigToProto = (config?: ContainerConfig | Partial<ContainerConfig>): ProtoContainerConfig => {
  if (!config) {
    return null
  }

  const protoConfig: ProtoContainerConfig = {
    common: {
      user: config.user,
      TTY: config.tty,
      ports: config.ports,
      portRanges: config.portRanges ?? [],
      volumes: volumesToProto(config.volumes),
      commands: config.commands ?? [],
      args: config.args ?? [],
      expose: exposeToProto(config.expose),
      ingress: config.ingress ? { ...config.ingress, uploadLimit: config.ingress?.uploadLimitInBytes } : null,
      configContainer: config.configContainer,
      importContainer: config.importContainer,
      name: config.name,
      environment: config.environment ?? [],
      initContainers: [],
      secrets: config.secrets ?? [],
    },
    dagent: undefined,
    crane: undefined,
    capabilities: config.capabilities,
  }

  if (config.initContainers) {
    protoConfig.common.initContainers = config.initContainers.map(
      it =>
        ({
          ...it,
          environment: it.environment ?? [],
        } as InitContainer),
    )
  }

  if (config.logConfig || config.restartPolicy || config.networkMode || config.networks) {
    protoConfig.dagent = {
      logConfig: logConfigToProto(config.logConfig),
      restartPolicy: restartPolicyTypeToProto(config.restartPolicy),
      networkMode: networkModeToProto(config.networkMode),
      networks: config.networks,
      labels: config.dockerLabels,
    }
  }

  if (
    config.deploymentStrategy ||
    config.customHeaders ||
    config.proxyHeaders ||
    config.useLoadBalancer ||
    config.healthCheckConfig ||
    config.resourceConfig ||
    config.extraLBAnnotations ||
    config.annotations ||
    config.labels
  ) {
    protoConfig.crane = {
      deploymentStatregy: deploymentStrategyToProto(config.deploymentStrategy),
      healthCheckConfig: config.healthCheckConfig,
      resourceConfig: config.resourceConfig,
      customHeaders: config.customHeaders,
      proxyHeaders: config.proxyHeaders,
      useLoadBalancer: config.useLoadBalancer,
      extraLBAnnotations: config.extraLBAnnotations,
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
  }

  return protoConfig
}

export const imageToDto = (image: ImageResponse): VersionImage => ({
  ...image,
  config: containerConfigToDto(image.config),
  createdAt: timestampToUTC(image.createdAt),
})
