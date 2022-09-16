import { VersionImage } from '@app/models'
import {
  ContainerConfig,
  ExplicitContainerConfig,
  ExplicitContainerConfigLog,
  ExplicitContainerDeploymentStrategyType,
  ExplicitContainerNetworkMode,
  ExplicitContainerRestartPolicyType,
} from '@app/models-config'
import {
  DeploymentStrategy,
  deploymentStrategyFromJSON,
  deploymentStrategyToJSON,
  ExplicitContainerConfig as ProtoExplicitContainerConfig,
  InitContainer,
  LogConfig,
  NetworkMode,
  networkModeFromJSON,
  networkModeToJSON,
  RestartPolicy,
  restartPolicyFromJSON,
  restartPolicyToJSON,
  Volume,
} from '@app/models/grpc/protobuf/proto/common'

import { ContainerConfig as ProtoContainerConfig, ImageResponse } from '@app/models/grpc/protobuf/proto/crux'

export const networkModeToDto = (networkMode?: NetworkMode): ExplicitContainerNetworkMode =>
  !networkMode ? 'bridge' : (networkModeToJSON(networkMode).toLocaleLowerCase() as ExplicitContainerNetworkMode)

export const deploymentStrategyToDto = (strategy?: DeploymentStrategy): ExplicitContainerDeploymentStrategyType =>
  !strategy
    ? 'recreate'
    : (deploymentStrategyToJSON(strategy).toLocaleLowerCase() as ExplicitContainerDeploymentStrategyType)

export const restartPolicyTypeToDto = (policy?: RestartPolicy): ExplicitContainerRestartPolicyType =>
  !policy ? 'unless_stopped' : (restartPolicyToJSON(policy).toLocaleLowerCase() as ExplicitContainerRestartPolicyType)

export const networkModeToProto = (networkMode?: ExplicitContainerNetworkMode): NetworkMode =>
  !networkMode ? undefined : networkModeFromJSON(networkMode.toUpperCase())

export const restartPolicyTypeToProto = (policy?: ExplicitContainerRestartPolicyType): RestartPolicy =>
  !policy ? undefined : restartPolicyFromJSON(policy.toUpperCase())

export const deploymentStrategyToProto = (strategy?: ExplicitContainerDeploymentStrategyType): DeploymentStrategy =>
  !strategy ? undefined : deploymentStrategyFromJSON(strategy.toUpperCase())

export const logConfigToProto = (logConfig?: ExplicitContainerConfigLog): LogConfig => {
  if (!logConfig) {
    return null
  }

  return { driver: logConfig.type, options: logConfig.config }
}

export const logConfigToDto = (logConfig?: LogConfig): ExplicitContainerConfigLog => {
  if (!logConfig) {
    return null
  }

  return { type: logConfig.driver, config: logConfig.options }
}

export const explicitContainerConfigToDto = (config?: ProtoExplicitContainerConfig): ExplicitContainerConfig => {
  if (!config) {
    return null
  }

  const explicit: ExplicitContainerConfig = {
    user: config.user ?? null,
    tty: config.TTY ?? false,
    ports: config.ports ?? [],
    portRanges: config.portRanges ?? [],
    volumes: config.volumes ?? [],
    commands: config.command ?? [],
    args: config.args ?? [],
    expose: config.expose ?? null,
    ingress: config.ingress ?? null,
    configContainer: config.configContainer ?? null,
    importContainer: config.importContainer ?? null,
    logConfig: logConfigToDto(config.dagent?.logConfig),
    restartPolicy: restartPolicyTypeToDto(config.dagent?.restartPolicy),
    networkMode: networkModeToDto(config.dagent?.networkMode),
    networks: config.dagent?.networks ?? [],
    deploymentStrategy: deploymentStrategyToDto(config.crane?.deploymentStatregy),
    customHeaders: config.crane?.customHeaders ?? [],
    proxyHeaders: config.crane?.proxyHeaders ?? false,
    useLoadBalancer: config.crane?.useLoadBalancer ?? false,
    extraLBAnnotations: config.crane?.extraLBAnnotations ?? null,
    healthCheckConfig: config.crane?.healthCheckConfig ?? null,
    resourceConfig: config.crane?.resourceConfig ?? null,
    initContainers: config.initContainers ?? [],
  }

  return explicit
}

export const explicitContainerConfigToProto = (config?: ExplicitContainerConfig): ProtoExplicitContainerConfig => {
  if (!config) {
    return null
  }

  const protoConfig: ProtoExplicitContainerConfig = {
    user: config.user,
    TTY: config.tty,
    ports: config.ports ?? [],
    portRanges: config.portRanges ?? [],
    volumes: (config.volumes ?? []) as Volume[],
    command: config.commands ?? [],
    args: config.args ?? [],
    importContainer: config.importContainer,
    configContainer: config.configContainer,
    dagent: undefined,
    crane: undefined,
    environments: [],
    initContainers: [],
  }

  if (config.initContainers) {
    protoConfig.initContainers = config.initContainers.map(
      it =>
        ({
          ...it,
          environments: it.environments ?? [],
        } as InitContainer),
    )
  }

  if (config.expose) {
    protoConfig.expose = { public: config.expose.public, tls: config.expose.tls }
  }

  if (config.ingress) {
    protoConfig.ingress = {
      name: config.ingress.name,
      host: config.ingress.host,
      uploadLimit: config.ingress.uploadLimitInBytes,
    }
  }

  if (config.logConfig || config.restartPolicy || config.networkMode) {
    protoConfig.dagent = {
      logConfig: logConfigToProto(config.logConfig),
      restartPolicy: restartPolicyTypeToProto(config.restartPolicy),
      networkMode: networkModeToProto(config.networkMode),
      networks: config.networks,
    }
  }

  if (
    config.deploymentStrategy ||
    config.customHeaders ||
    config.proxyHeaders ||
    config.useLoadBalancer ||
    config.healthCheckConfig ||
    config.resourceConfig ||
    config.extraLBAnnotations
  ) {
    protoConfig.crane = {
      deploymentStatregy: deploymentStrategyToProto(config.deploymentStrategy),
      healthCheckConfig: config.healthCheckConfig,
      resourceConfig: config.resourceConfig,
      customHeaders: config.customHeaders ?? [],
      proxyHeaders: config.proxyHeaders,
      useLoadBalancer: config.useLoadBalancer,
      extraLBAnnotations: config.extraLBAnnotations,
    }
  }

  return protoConfig
}

export const containerConfigToDto = (config?: ProtoContainerConfig): ContainerConfig =>
  !config
    ? null
    : {
        ...config,
        config: explicitContainerConfigToDto(config.config),
      }

export const imageToDto = (image: ImageResponse): VersionImage => ({
  ...image,
  config: containerConfigToDto(image.config),
})
