import { Injectable } from '@nestjs/common'
import {
  ContainerStateEnum,
  Deployment,
  DeploymentEvent,
  DeploymentEventTypeEnum,
  DeploymentStatusEnum,
  Instance,
  InstanceContainerConfig,
  Node,
  VersionTypeEnum,
} from '@prisma/client'
import { JsonArray, JsonObject } from 'prisma'
import { toTimestamp } from 'src/domain/utils'
import { InternalException } from 'src/exception/errors'
import {
  CommonContainerConfig,
  CraneContainerConfig,
  DagentContainerConfig,
  InitContainer as AgentInitContainer,
  InstanceConfig,
} from 'src/grpc/protobuf/proto/agent'
import {
  ContainerState,
  containerStateFromJSON,
  containerStateToJSON,
  DeploymentStatus,
  deploymentStatusFromJSON,
  KeyValue,
} from 'src/grpc/protobuf/proto/common'
import {
  AuditResponse,
  ContainerConfig as ProtoContainerConfig,
  DeploymentByVersionResponse,
  DeploymentDetailsResponse,
  DeploymentEventContainerState,
  DeploymentEventLog,
  DeploymentEventResponse,
  DeploymentEventType,
  DeploymentResponse,
  InitContainer,
  InstanceResponse,
  NodeConnectionStatus,
} from 'src/grpc/protobuf/proto/crux'
import { versionTypeToGrpc } from 'src/shared/mapper'
import {
  ContainerConfigData,
  ContainerConfigPort,
  InstanceContainerConfigData,
  MergedContainerConfigData,
  UniqueKey,
  UniqueKeyValue,
  UniqueSecretKeyValue,
} from 'src/shared/models'
import AgentService from '../agent/agent.service'
import ImageMapper, { ImageDetails } from '../image/image.mapper'

@Injectable()
export default class DeployMapper {
  constructor(private imageMapper: ImageMapper, private agentService: AgentService) {}

  listItemToGrpc(deployment: DeploymentListItem): DeploymentResponse {
    return {
      ...deployment,
      node: deployment.node.name,
      product: deployment.version.product.name,
      version: deployment.version.name,
      status: this.statusToGrpc(deployment.status),
      productId: deployment.version.product.id,
      versionId: deployment.version.id,
      nodeId: deployment.node.id,
      updatedAt: toTimestamp(deployment.updatedAt),
      versionType: versionTypeToGrpc(deployment.version.type),
    }
  }

  deploymentByVersionToGrpc(deployment: DeploymentWithNode): DeploymentByVersionResponse {
    const agent = this.agentService.getById(deployment.nodeId)

    const status = agent?.getConnectionStatus() ?? NodeConnectionStatus.UNREACHABLE
    return {
      ...deployment,
      audit: AuditResponse.fromJSON(deployment),
      status: this.statusToGrpc(deployment.status),
      nodeId: deployment.nodeId,
      nodeName: deployment.node.name,
      nodeStatus: status,
    }
  }

  detailsToGrpc(deployment: DeploymentDetails, publicKey?: string): DeploymentDetailsResponse {
    return {
      ...deployment,
      audit: AuditResponse.fromJSON(deployment),
      productVersionId: deployment.versionId,
      status: this.statusToGrpc(deployment.status),
      publicKey,
      environment: deployment.environment as JsonArray,
      instances: deployment.instances.map(it => ({
        ...this.instanceToGrpc(it),
        audit: AuditResponse.fromJSON(deployment),
      })),
    }
  }

  instanceToGrpc(instance: InstanceDetails): InstanceResponse {
    return {
      ...instance,
      audit: AuditResponse.fromJSON(instance),
      image: this.imageMapper.toGrpc(instance.image),
      state: this.containerStateToGrpc(instance.state),
      config: instance.config ? this.instanceConfigToGrpc(instance.config) : null,
    }
  }

  instanceConfigToGrpc(instanceConfig: InstanceContainerConfig): ProtoContainerConfig {
    const config = instanceConfig as any as InstanceContainerConfigData

    return {
      capabilities: config.capabilities,
      common: this.imageMapper.configToCommonConfig(config, (it: UniqueSecretKeyValue) => it),
      dagent: this.imageMapper.configToDagentConfig(config),
      crane: this.imageMapper.configToCraneConfig(config),
    }
  }

  instanceConfigToInstanceContainerConfigData(config: ProtoContainerConfig): InstanceContainerConfigData {
    return this.imageMapper.configProtoToContainerConfigData(config)
  }

  instanceContainerConfigDataToDb(
    config: InstanceContainerConfigData,
  ): Omit<InstanceContainerConfig, 'id' | 'instanceId'> {
    return this.imageMapper.containerConfigDataToDb(config)
  }

  eventToGrpc(event: DeploymentEvent): DeploymentEventResponse {
    let log: DeploymentEventLog
    let deploymentStatus: DeploymentStatus
    let containerStatus: DeploymentEventContainerState
    switch (event.type) {
      case DeploymentEventTypeEnum.log: {
        log = DeploymentEventLog.fromJSON({
          log: event.value,
        })
        break
      }
      case DeploymentEventTypeEnum.deploymentStatus: {
        deploymentStatus = this.statusToGrpc(event.value as DeploymentStatusEnum)
        break
      }
      case DeploymentEventTypeEnum.containerStatus: {
        const value = event.value as { instanceId: string; state: string }
        containerStatus = DeploymentEventContainerState.fromJSON({
          ...value,
          state: value.state.toUpperCase(),
        })
        break
      }
      default:
        throw new InternalException({
          message: 'Unsupported deployment event type!',
        })
    }

    return {
      ...event,
      createdAt: toTimestamp(event.createdAt),
      type: this.eventTypeToGrpc(event.type),
      log,
      deploymentStatus,
      containerStatus,
    }
  }

  eventTypeToGrpc(type: DeploymentEventTypeEnum) {
    switch (type) {
      case 'containerStatus':
        return DeploymentEventType.CONTAINER_STATUS
      case 'deploymentStatus':
        return DeploymentEventType.DEPLOYMENT_STATUS
      case 'log':
        return DeploymentEventType.DEPLOYMENT_LOG
      default:
        throw new InternalException({
          message: 'Unsupported event type!',
        })
    }
  }

  deploymentToAgentInstanceConfig(deployment: Deployment): InstanceConfig {
    return {
      prefix: deployment.prefix,
      environment: {
        env: this.jsonToPipedFormat((deployment.environment as UniqueKeyValue[]) ?? []),
      },
    }
  }

  statusToGrpc(status: DeploymentStatusEnum): DeploymentStatus {
    switch (status) {
      case DeploymentStatusEnum.inProgress:
        return DeploymentStatus.IN_PROGRESS
      default:
        return deploymentStatusFromJSON(status.toUpperCase())
    }
  }

  containerStateToGrpc(state?: ContainerStateEnum): ContainerState {
    return state ? containerStateFromJSON(state.toUpperCase()) : null
  }

  containerStateToDb(state?: ContainerState): ContainerStateEnum {
    return state ? (containerStateToJSON(state).toLowerCase() as ContainerStateEnum) : null
  }

  configToCommonConfig(config: ContainerConfigData): CommonContainerConfig {
    return {
      name: config.name,
      environment: this.jsonToPipedFormat(config.environment as JsonArray),
      secrets: this.mapKeyValueToMap(config.secrets as JsonObject),
      commands: this.mapUniqueKeyToStringArray(config.commands as JsonObject),
      expose: this.imageMapper.exposeStrategyToGrpc(config.expose),
      args: this.mapUniqueKeyToStringArray(config.args as JsonObject),
      TTY: config.tty,
      configContainer: config.configContainer as JsonObject,
      importContainer: config.importContainer
        ? {
            ...(config.importContainer as JsonObject),
            environments: this.mapKeyValueToMap((config.importContainer as JsonObject)?.environments),
          }
        : null,
      ingress: config.ingress as JsonObject,
      initContainers: this.mapInitContainerToAgent(config.initContainers as JsonObject),
      portRanges: config.portRanges as JsonObject,
      ports: config.ports as JsonObject,
      user: config.user,
      volumes: config.volumes as JsonObject,
    }
  }

  configToDagentConfig(config: ContainerConfigData): DagentContainerConfig {
    return {
      networks: this.mapUniqueKeyToStringArray(config.networks as JsonObject),
      logConfig: config.logConfig
        ? {
            ...(config.logConfig as JsonObject),
            options: this.mapKeyValueToMap((config.logConfig as JsonObject)?.options),
          }
        : null,
      networkMode: this.imageMapper.networkModeToProto(config.networkMode),
      restartPolicy: this.imageMapper.restartPolicyToProto(config.restartPolicy),
      labels: this.mapKeyValueToMap(config.dockerLabels),
    }
  }

  configToCraneConfig(config: ContainerConfigData): CraneContainerConfig {
    return {
      customHeaders: this.mapUniqueKeyToStringArray(config.customHeaders as JsonObject),
      extraLBAnnotations: this.mapKeyValueToMap(config.extraLBAnnotations as JsonObject),
      deploymentStatregy: this.imageMapper.deploymentStrategyToProto(config.deploymentStrategy),
      healthCheckConfig: config.healthCheckConfig as JsonObject,
      proxyHeaders: config.proxyHeaders,
      useLoadBalancer: config.useLoadBalancer,
      resourceConfig: config.resourceConfig as JsonObject,
      labels: config.labels
        ? {
            deployment: this.mapKeyValueToMap((config.labels as JsonObject)?.deployment),
            ingress: this.mapKeyValueToMap((config.labels as JsonObject)?.ingress),
            service: this.mapKeyValueToMap((config.labels as JsonObject)?.service),
          }
        : null,
      annotations: config.annotations
        ? {
            deployment: this.mapKeyValueToMap((config.annotations as JsonObject)?.deployment),
            ingress: this.mapKeyValueToMap((config.annotations as JsonObject)?.ingress),
            service: this.mapKeyValueToMap((config.annotations as JsonObject)?.service),
          }
        : null,
    }
  }

  private mapInitContainerToAgent(list: InitContainer[]): AgentInitContainer[] {
    const result: AgentInitContainer[] = []

    list?.forEach(it => {
      result.push({
        ...it,
        environment: this.mapKeyValueToMap(it.environment as KeyValue[]),
        command: it.command.map(cit => cit.key),
        args: it.args.map(ait => ait.key),
      })
    })

    return result
  }

  private mapKeyValueToMap(list: KeyValue[]): { [key: string]: string } {
    if (!list) {
      return {}
    }

    const result: { [key: string]: string } = {}

    list?.forEach(it => {
      result[it.key] = it.value
    })

    return result
  }

  private mapUniqueKeyToStringArray(list: UniqueKey[]): string[] {
    if (!list) {
      return []
    }

    return list.map(it => it.key)
  }

  private jsonToPipedFormat(environment: UniqueKeyValue[]): string[] {
    if (!environment) {
      return []
    }

    return environment.map(it => `${it.key}|${it.value}`)
  }

  private overrideKeyValues(weak: UniqueKeyValue[], strong: UniqueKeyValue[]): UniqueKeyValue[] {
    const overriddenKeys: Set<string> = new Set(strong?.map(it => it.key))
    return [...(weak?.filter(it => !overriddenKeys.has(it.key)) ?? []), ...(strong ?? [])]
  }

  private overridePorts(weak: ContainerConfigPort[], strong: ContainerConfigPort[]): ContainerConfigPort[] {
    const overridenPorts: Set<number> = new Set(strong?.map(it => it.internal))
    return [...(weak?.filter(it => !overridenPorts.has(it.internal)) ?? []), ...(strong ?? [])]
  }

  private override = <T>(weak: T, strong: T): T => strong ?? weak

  private combineArrays = <T>(weak: T[], strong: T[]): T[] => [
    ...(weak?.filter(it => !strong.indexOf(it)) ?? []),
    ...(strong ?? []),
  ]

  public mergeConfigs(
    imageConfig: ContainerConfigData,
    instanceConfig: InstanceContainerConfigData,
  ): MergedContainerConfigData {
    const envs = this.overrideKeyValues(imageConfig?.environment, instanceConfig?.environment)
    const caps = this.overrideKeyValues(imageConfig?.capabilities, instanceConfig?.capabilities)
    const ports = this.overridePorts(imageConfig?.ports, instanceConfig?.ports)

    return {
      // common
      name: instanceConfig.name || imageConfig.name,
      environment: envs,
      secrets: instanceConfig?.secrets
        ? instanceConfig.secrets
        : imageConfig.secrets?.map(it => ({ ...it, value: '', publicKey: '' })) ?? [],
      user: this.override(imageConfig?.user, instanceConfig.user),
      tty: this.override(imageConfig?.tty, instanceConfig.tty),
      portRanges: this.override(imageConfig?.portRanges, instanceConfig.portRanges),
      args: this.override(imageConfig?.args, instanceConfig.args),
      commands: this.override(imageConfig?.commands, instanceConfig.commands),
      expose: this.override(imageConfig?.expose, instanceConfig.expose),
      configContainer: this.override(imageConfig?.configContainer, instanceConfig.configContainer),
      ingress: this.override(imageConfig?.ingress, instanceConfig.ingress),
      volumes: this.override(imageConfig?.volumes, instanceConfig.volumes),
      importContainer: this.override(imageConfig?.importContainer, instanceConfig.importContainer),
      initContainers: this.override(imageConfig?.initContainers, instanceConfig.initContainers),
      capabilities: caps,
      ports,

      // crane
      customHeaders: this.combineArrays(imageConfig?.customHeaders, instanceConfig?.customHeaders),
      proxyHeaders: this.override(imageConfig?.proxyHeaders, instanceConfig?.proxyHeaders),
      extraLBAnnotations: this.override(imageConfig?.extraLBAnnotations, instanceConfig?.extraLBAnnotations),
      healthCheckConfig: this.override(imageConfig?.healthCheckConfig, instanceConfig?.healthCheckConfig),
      resourceConfig: this.override(imageConfig?.resourceConfig, instanceConfig?.resourceConfig),
      useLoadBalancer: this.override(imageConfig?.useLoadBalancer, instanceConfig?.useLoadBalancer),
      deploymentStrategy: this.override(imageConfig?.deploymentStrategy, instanceConfig?.deploymentStrategy),
      labels: this.override(imageConfig?.labels, instanceConfig?.labels),
      annotations: this.override(imageConfig?.annotations, instanceConfig?.annotations),

      // dagent
      logConfig: this.override(imageConfig?.logConfig, instanceConfig?.logConfig),
      networkMode: this.override(imageConfig?.networkMode, instanceConfig?.networkMode),
      restartPolicy: this.override(imageConfig?.restartPolicy, instanceConfig?.restartPolicy),
      networks: this.combineArrays(imageConfig?.networks, instanceConfig?.networks),
      dockerLabels: this.combineArrays(imageConfig?.dockerLabels, instanceConfig?.dockerLabels),
    }
  }
}

export type InstanceDetails = Instance & {
  image: ImageDetails
  config?: InstanceContainerConfig
}

export type DeploymentWithNode = Deployment & {
  node: Node
}

export type DeploymentDetails = DeploymentWithNode & {
  instances: InstanceDetails[]
}

type DeploymentListItem = Deployment & {
  node: { id: string; name: string }
  version: { id: string; name: string; product: { id: string; name: string }; type: VersionTypeEnum }
}
