import { Injectable } from '@nestjs/common'
import {
  ContainerConfig,
  ContainerStateEnum,
  Deployment,
  DeploymentEvent,
  DeploymentEventTypeEnum,
  DeploymentStatusEnum,
  Instance,
  InstanceContainerConfig,
  Node,
} from '@prisma/client'
import { JsonArray, JsonObject } from 'prisma'
import { deploymentStatusToDb } from 'src/domain/deployment'
import { toTimestamp } from 'src/domain/utils'
import { DeployRequest_InstanceConfig } from 'src/grpc/protobuf/proto/agent'
import {
  AuditResponse,
  DeploymentByVersionResponse,
  DeploymentDetailsResponse,
  DeploymentEventContainerState,
  DeploymentEventLog,
  DeploymentEventResponse,
  DeploymentEventType,
  DeploymentResponse,
  InstanceResponse,
  NodeConnectionStatus,
} from 'src/grpc/protobuf/proto/crux'
import {
  ContainerState,
  containerStateFromJSON,
  containerStateToJSON,
  DeploymentStatus,
  deploymentStatusFromJSON,
  ExplicitContainerConfig,
  NetworkMode,
  Port,
  UniqueKeySecretValue,
} from 'src/grpc/protobuf/proto/common'
import { ContainerConfigData, InstanceContainerConfigData, UniqueKeyValue } from 'src/shared/model'
import { ImageMapper, ImageWithConfig } from '../image/image.mapper'
import { AgentService } from '../agent/agent.service'

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
    const config: DeploymentContainerConfig = {
      ...(instance.config ?? instance.image.config),
      instanceId: instance.id,
      // name: instance.image.config.name,
    }

    return {
      ...instance,
      audit: AuditResponse.fromJSON(instance),
      image: this.imageMapper.toGrpc(instance.image),
      state: this.containerStateToGrpc(instance.state),
      config: {
        capabilities: (instance.config?.capabilities as UniqueKeyValue[]) ?? [],
        environment: (instance.config?.environment as UniqueKeyValue[]) ?? [],
        config: config.config as JsonObject,
        secrets: (instance.config?.secrets as unknown as UniqueKeySecretValue[]) ?? [],
      },
    }
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
        deploymentStatus = deploymentStatusFromJSON(event.value)
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

  instanceToAgentContainerConfig(instance: InstanceDetails): ExplicitContainerConfig {
    const imageConfig = (instance.image.config ?? {}) as ContainerConfigData
    const instaceConfig = (instance.config ?? {}) as InstanceContainerConfigData

    const config = this.mergeConfigs(imageConfig, instaceConfig) as InstanceContainerConfigData

    return {
      ...config.config,
      environments: this.jsonToPipedFormat(config.environment ?? []),
      user: config.config.user ?? 0,
      secrets: { data: config?.secrets },
    }
  }

  deploymentToAgentInstanceConfig(deployment: Deployment): DeployRequest_InstanceConfig {
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

  statusToDb(status: DeploymentStatus): DeploymentStatusEnum {
    switch (status) {
      case DeploymentStatus.IN_PROGRESS:
        return DeploymentStatusEnum.inProgress
      default:
        return deploymentStatusToDb(status)
    }
  }

  containerStateToGrpc(state?: ContainerStateEnum): ContainerState {
    return state ? containerStateFromJSON(state.toUpperCase()) : null
  }

  containerStateToDb(state?: ContainerState): ContainerStateEnum {
    return state ? (containerStateToJSON(state).toLowerCase() as ContainerStateEnum) : null
  }

  private jsonToPipedFormat(environment: UniqueKeyValue[]): string[] {
    return environment.map(it => `${it.key}|${it.value}`)
  }

  private overrideKeyValues(weak: UniqueKeyValue[], strong: UniqueKeyValue[]): UniqueKeyValue[] {
    const overriddenKeys: Set<string> = new Set(strong?.map(it => it.key))
    return [...(weak?.filter(it => !overriddenKeys.has(it.key)) ?? []), ...(strong ?? [])]
  }

  private overridePorts(weak: Port[], strong: Port[]): Port[] {
    const overridenPorts: Set<number> = new Set(strong?.map(it => it.internal))
    return [...(weak?.filter(it => !overridenPorts.has(it.internal)) ?? []), ...(strong ?? [])]
  }

  private overrideArrays = <T>(weak: T[], strong: T[]): T[] => {
    const strongs: Set<T> = new Set(strong?.map(it => it))
    return [...(weak?.filter(it => !strongs.has(it)) ?? []), ...(strong ?? [])]
  }

  private overrideNetworkMode(weak: NetworkMode, strong: NetworkMode) {
    return strong ?? weak ?? 'none'
  }

  private mergeConfigs(
    imageConfig: ContainerConfigData,
    instanceConfig: InstanceContainerConfigData,
  ): ContainerConfigData | InstanceContainerConfigData {
    const envs = this.overrideKeyValues(imageConfig?.environment, instanceConfig?.environment)
    const caps = this.overrideKeyValues(imageConfig?.capabilities, instanceConfig?.capabilities)
    return {
      name: imageConfig.name,
      environment: envs,
      capabilities: caps,
      secrets: instanceConfig.secrets,
      config: {
        ...imageConfig?.config,
        ...instanceConfig?.config,
        networkMode: this.overrideNetworkMode(
          imageConfig?.config?.dagent?.networkMode,
          instanceConfig?.config?.dagent?.networkMode,
        ),
        networks: this.overrideArrays(imageConfig?.config?.dagent?.networks, instanceConfig?.config?.dagent?.networks),
        ports: this.overridePorts(imageConfig?.config?.ports, instanceConfig?.config?.ports),
      },
    }
  }
}

export type InstanceDetails = Instance & {
  image: ImageWithConfig
  config?: InstanceContainerConfig
}

export type DeploymentWithNode = Deployment & {
  node: Node
}

export type DeploymentDetails = DeploymentWithNode & {
  instances: InstanceDetails[]
}

type DeploymentContainerConfig = Omit<InstanceContainerConfig, 'imageId'>

type DeploymentListItem = Deployment & {
  node: { id: string; name: string }
  version: { id: string; name: string; product: { id: string; name: string } }
}
