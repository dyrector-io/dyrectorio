import { Injectable } from '@nestjs/common'
import {
  ContainerConfig,
  DeploymentStrategy,
  ExposeStrategy,
  Image,
  NetworkMode,
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
  CommonContainerConfig as ProtoAgentCommonContainerConfig,
  CommonContainerConfig as ProtoCruxCommonContainerConfig,
  ContainerConfig as ProtoContainerConfig,
  CraneContainerConfig as ProtoAgentCraneContainerConfig,
  CraneContainerConfig as ProtoCruxCraneContainerConfig,
  DagentContainerConfig as ProtoAgentDagentContainerConfig,
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

  configToCommonConfig(config: ContainerConfigData): ProtoAgentCommonContainerConfig | ProtoCruxCommonContainerConfig {
    return {
      name: config.name,
      environments: config.environment as JsonObject,
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

  configToDagentConfig(config: ContainerConfigData): ProtoAgentDagentContainerConfig | ProtoCruxDagentContainerConfig {
    return {
      networks: config.networks as JsonObject,
      logConfig: config.logConfig as JsonObject,
      networkMode: this.networkModeToProto(config.networkMode),
      restartPolicy: this.restartPolicyToProto(config.restartPolicy),
    }
  }

  configToCraneConfig(config: ContainerConfigData): ProtoAgentCraneContainerConfig | ProtoCruxCraneContainerConfig {
    return {
      customHeaders: config.customHeaders as JsonObject,
      extraLBAnnotations: config.extraLBAnnotations as JsonObject,
      deploymentStatregy: this.deploymentStrategyToProto(config.deploymentStrategy),
      healthCheckConfig: config.healthCheckConfig as JsonObject,
      proxyHeaders: config.proxyHeaders,
      useLoadBalancer: config.useLoadBalancer,
      resourceConfig: config.resourceConfig as JsonObject,
    }
  }

  configProtoToDb(config: ProtoContainerConfig): ContainerConfigData {
    return {
      //common
      name: config.common?.name,
      expose: this.exposeStrategyToDb(config.common?.expose),
      ingress: config.common?.ingress as JsonObject,
      configContainer: config.common?.configContainer as JsonObject,
      importContainer: config.common?.importContainer as JsonObject,
      user: config.common?.user,
      tty: config.common?.TTY,
      ports: config.common?.ports as JsonObject,
      portRanges: config.common?.portRanges as JsonObject,
      volumes: config.common?.volumes as JsonObject,
      commands: config.common?.commands as JsonObject,
      args: config.common?.args as JsonObject,
      environment: config.common?.environments as JsonObject,
      secrets: config.common?.secrets as JsonObject,
      initContainers: config.common?.initContainers as JsonObject,
      logConfig: config.dagent?.logConfig as JsonObject,
      //dagent
      restartPolicy: this.restartPolicyToDb(config.dagent?.restartPolicy),
      networkMode: this.networkModeToDb(config.dagent?.networkMode),
      networks: config.dagent?.networks as JsonObject,
      //crane
      deploymentStrategy: this.deploymentStrategyToDb(config.crane?.deploymentStatregy),
      healthCheckConfig: config.crane?.healthCheckConfig as JsonObject,
      resourceConfig: config.crane?.resourceConfig as JsonObject,
      proxyHeaders: config.crane?.proxyHeaders,
      useLoadBalancer: config.crane?.useLoadBalancer,
      customHeaders: config.crane?.customHeaders as JsonObject,
      extraLBAnnotations: config.crane?.extraLBAnnotations as JsonObject,
      capabilities: config.capabilities as JsonObject,
    }
  }

  deploymentStrategyToProto(type: DeploymentStrategy): ProtoDeploymentStrategy {
    switch (type) {
      case DeploymentStrategy.recreate:
        return ProtoDeploymentStrategy.RECREATE
      case DeploymentStrategy.rolling:
        return ProtoDeploymentStrategy.ROLLING
      default:
        return ProtoDeploymentStrategy.UNKOWN_DEPLOYMENT_STRATEGY
    }
  }

  deploymentStrategyToDb(type: ProtoDeploymentStrategy): DeploymentStrategy {
    switch (type) {
      case ProtoDeploymentStrategy.RECREATE:
        return DeploymentStrategy.recreate
      case ProtoDeploymentStrategy.ROLLING:
        return DeploymentStrategy.rolling
      default:
        return null
    }
  }

  exposeStrategyToProto(type: ExposeStrategy): ProtoExposeStrategy {
    switch (type) {
      case ExposeStrategy.expose:
        return ProtoExposeStrategy.EXPOSE
      case ExposeStrategy.expose_with_tls:
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
        return ExposeStrategy.expose_with_tls
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
      case RestartPolicy.unless_stopped:
        return ProtoRestartPolicy.UNLESS_STOPPED
      case RestartPolicy.on_failure:
        return ProtoRestartPolicy.ON_FAILURE
      default:
        return ProtoRestartPolicy.UNDEFINED
    }
  }

  restartPolicyToDb(type: ProtoRestartPolicy): RestartPolicy {
    switch (type) {
      case ProtoRestartPolicy.ALWAYS:
        return RestartPolicy.always
      case ProtoRestartPolicy.NO:
        return RestartPolicy.no
      case ProtoRestartPolicy.UNLESS_STOPPED:
        return RestartPolicy.unless_stopped
      case ProtoRestartPolicy.ON_FAILURE:
        return RestartPolicy.on_failure
      default:
        return null
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
