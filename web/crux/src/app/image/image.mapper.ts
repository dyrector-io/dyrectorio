import { Injectable } from '@nestjs/common'
import {
  ContainerConfig,
  DeploymentStrategy,
  ExposeStrategy,
  Image,
  NetworkMode,
  Prisma,
  Registry,
  RestartPolicy,
} from '@prisma/client'
import { JsonObject } from 'prisma'
import { toTimestamp } from 'src/domain/utils'
import {
  DeploymentStrategy as ProtoDeploymentStrategy,
  ExposeStrategy as ProtoExposeStrategy,
  NetworkMode as ProtoNetworkMode,
  RestartPolicy as ProtoRestartPolicy,
} from 'src/grpc/protobuf/proto/common'
import {
  CommonContainerConfig as ProtoCruxCommonContainerConfig,
  ContainerConfig as ProtoContainerConfig,
  CraneContainerConfig as ProtoCruxCraneContainerConfig,
  DagentContainerConfig as ProtoCruxDagentContainerConfig,
  ImageResponse,
} from 'src/grpc/protobuf/proto/crux'
import { ContainerConfigData, UniqueKeyValue } from 'src/shared/model'

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

  configToGrpc(config: ContainerConfigData): ProtoContainerConfig {
    return {
      capabilities: config.capabilities as UniqueKeyValue[],
      common: this.configToCommonConfig(config),
      dagent: this.configToDagentConfig(config),
      crane: this.configToCraneConfig(config),
    }
  }

  configToCommonConfig(config: ContainerConfigData): ProtoCruxCommonContainerConfig {
    return {
      name: config.name,
      environment: config.environment as JsonObject,
      secrets: config.secrets as JsonObject,
      commands: config.commands as JsonObject,
      expose: this.exposeStrategyToProto(config.expose),
      args: config.args as JsonObject,
      TTY: config.tty,
      configContainer: config.configContainer as JsonObject,
      importContainer: config.importContainer as JsonObject,
      ingress: config.ingress as JsonObject,
      initContainers: config.initContainers as JsonObject,
      portRanges: config.portRanges as JsonObject,
      ports: config.ports as JsonObject,
      user: config.user,
      volumes: config.volumes as JsonObject,
    }
  }

  configToDagentConfig(config: ContainerConfigData): ProtoCruxDagentContainerConfig {
    return {
      networks: config.networks as JsonObject,
      logConfig: config.logConfig as JsonObject,
      networkMode: this.networkModeToProto(config.networkMode),
      restartPolicy: this.restartPolicyToProto(config.restartPolicy),
      labels: config.dockerLabels as JsonObject,
    }
  }

  configToCraneConfig(config: ContainerConfigData): ProtoCruxCraneContainerConfig {
    return {
      customHeaders: config.customHeaders as JsonObject,
      extraLBAnnotations: config.extraLBAnnotations as JsonObject,
      deploymentStatregy: this.deploymentStrategyToProto(config.deploymentStrategy),
      healthCheckConfig: config.healthCheckConfig as JsonObject,
      proxyHeaders: config.proxyHeaders,
      useLoadBalancer: config.useLoadBalancer,
      resourceConfig: config.resourceConfig as JsonObject,
      labels: config.labels as JsonObject,
      annotations: config.annotations as JsonObject,
    }
  }

  toPrismaJson(val) {
    if (!val) {
      return Prisma.JsonNull
    }

    return val as JsonObject
  }

  configProtoToDb(config: ProtoContainerConfig): ContainerConfigData {
    return {
      // common
      name: config.common?.name,
      expose: this.exposeStrategyToDb(config.common?.expose),
      ingress: this.toPrismaJson(config.common?.ingress),
      configContainer: this.toPrismaJson(config.common?.configContainer),
      importContainer: this.toPrismaJson(config.common?.importContainer),
      user: config.common?.user ? config.common.user : null,
      tty: config.common?.TTY ?? false,
      ports: this.toPrismaJson(config.common?.ports),
      portRanges: this.toPrismaJson(config.common?.portRanges),
      volumes: this.toPrismaJson(config.common?.volumes),
      commands: this.toPrismaJson(config.common?.commands),
      args: this.toPrismaJson(config.common?.args),
      environment: this.toPrismaJson(config.common?.environment),
      secrets: this.toPrismaJson(config.common?.secrets),
      initContainers: this.toPrismaJson(config.common?.initContainers),
      logConfig: this.toPrismaJson(config.dagent?.logConfig),

      // dagent
      restartPolicy: this.restartPolicyToDb(config.dagent?.restartPolicy),
      networkMode: this.networkModeToDb(config.dagent?.networkMode),
      networks: this.toPrismaJson(config.dagent?.networks),
      dockerLabels: this.toPrismaJson(config.dagent?.labels),

      // crane
      deploymentStrategy: this.deploymentStrategyToDb(config.crane?.deploymentStatregy),
      healthCheckConfig: this.toPrismaJson(config.crane?.healthCheckConfig),
      resourceConfig: this.toPrismaJson(config.crane?.resourceConfig),
      proxyHeaders: config.crane?.proxyHeaders ?? false,
      useLoadBalancer: config.crane?.useLoadBalancer ?? false,
      customHeaders: this.toPrismaJson(config.crane?.customHeaders),
      extraLBAnnotations: this.toPrismaJson(config.crane?.extraLBAnnotations),
      capabilities: this.toPrismaJson(config.capabilities),
      annotations: this.toPrismaJson(config.crane?.annotations),
      labels: this.toPrismaJson(config.crane?.labels),
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

  exposeStrategyToProto(type: ExposeStrategy): ProtoExposeStrategy {
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

  networkModeToProto(type: NetworkMode): ProtoNetworkMode {
    switch (type) {
      case NetworkMode.bridge:
        return ProtoNetworkMode.BRIDGE
      case NetworkMode.host:
        return ProtoNetworkMode.HOST
      default:
        return ProtoNetworkMode.NONE
    }
  }

  networkModeToDb(type: ProtoNetworkMode): NetworkMode {
    switch (type) {
      case ProtoNetworkMode.BRIDGE:
        return NetworkMode.bridge
      case ProtoNetworkMode.HOST:
        return NetworkMode.host
      default:
        return NetworkMode.none
    }
  }
}

export type ImageDetails = Image & {
  config: ContainerConfig
  registry: Registry
}
