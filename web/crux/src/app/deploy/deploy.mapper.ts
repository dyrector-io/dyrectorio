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
  DeploymentByVersionResponse,
  DeploymentDetailsResponse,
  DeploymentEventContainerState,
  DeploymentEventLog,
  DeploymentEventResponse,
  DeploymentEventType,
  DeploymentResponse,
  InitContainer,
  InstanceContainerConfig as ProtoInstanceContainerConfig,
  InstanceResponse,
  NodeConnectionStatus,
  UniqueSecretKey,
} from 'src/grpc/protobuf/proto/crux'
import { versionTypeToProto } from 'src/shared/mapper'
import {
  ContainerConfigData,
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

  listItemToProto(deployment: DeploymentListItem): DeploymentResponse {
    return {
      ...deployment,
      node: deployment.node.name,
      product: deployment.version.product.name,
      version: deployment.version.name,
      status: this.statusToProto(deployment.status),
      productId: deployment.version.product.id,
      versionId: deployment.version.id,
      nodeId: deployment.node.id,
      updatedAt: toTimestamp(deployment.updatedAt),
      versionType: versionTypeToProto(deployment.version.type),
    }
  }

  deploymentByVersionToProto(deployment: DeploymentWithNode): DeploymentByVersionResponse {
    const agent = this.agentService.getById(deployment.nodeId)

    const status = agent?.getConnectionStatus() ?? NodeConnectionStatus.UNREACHABLE
    return {
      ...deployment,
      audit: AuditResponse.fromJSON(deployment),
      status: this.statusToProto(deployment.status),
      nodeId: deployment.nodeId,
      nodeName: deployment.node.name,
      nodeStatus: status,
    }
  }

  detailsToProto(deployment: DeploymentDetails, publicKey?: string): DeploymentDetailsResponse {
    return {
      ...deployment,
      audit: AuditResponse.fromJSON(deployment),
      productVersionId: deployment.versionId,
      status: this.statusToProto(deployment.status),
      publicKey,
      environment: deployment.environment as UniqueKeyValue[],
      instances: deployment.instances.map(it => ({
        ...this.instanceToProto(it),
        audit: AuditResponse.fromJSON(deployment),
      })),
    }
  }

  instanceToProto(instance: InstanceDetails): InstanceResponse {
    const config = this.mergeConfigs(
      (instance.image.config ?? {}) as ContainerConfigData,
      (instance.config ?? {}) as InstanceContainerConfigData,
    )

    return {
      ...instance,
      audit: AuditResponse.fromJSON(instance),
      image: this.imageMapper.detailsToProto(instance.image),
      state: this.containerStateToProto(instance.state),
      config: this.instanceConfigToProto(config),
    }
  }

  instanceConfigToProto(config: InstanceContainerConfigData): ProtoInstanceContainerConfig {
    return {
      common: this.imageMapper.configToCommonConfig(config),
      dagent: this.imageMapper.configToDagentConfig(config),
      crane: this.imageMapper.configToCraneConfig(config),
      secrets: !config.secrets ? null : { data: config.secrets },
    }
  }

  instanceConfigToInstanceContainerConfigData(
    imageConfig: ContainerConfigData,
    currentConfig: InstanceContainerConfigData,
    configPatch: ProtoInstanceContainerConfig,
  ): InstanceContainerConfigData {
    const config = this.imageMapper.configProtoToContainerConfigData(currentConfig, configPatch)

    if (config.labels) {
      const currentLabels = currentConfig.labels ?? imageConfig.labels ?? {}

      config.labels = {
        deployment: config.labels.deployment ?? currentLabels.deployment,
        ingress: config.labels.ingress ?? currentLabels.ingress,
        service: config.labels.service ?? currentLabels.service,
      }
    }

    if (config.annotations) {
      const currentAnnotations = currentConfig.annotations ?? imageConfig.annotations ?? {}

      config.annotations = {
        deployment: config.annotations.deployment ?? currentAnnotations.deployment,
        ingress: config.annotations.ingress ?? currentAnnotations.ingress,
        service: config.annotations.service ?? currentAnnotations.service,
      }
    }

    let secrets = !configPatch.secrets ? undefined : configPatch.secrets.data
    if (secrets && !currentConfig.secrets && imageConfig.secrets) {
      secrets = this.mergeSecrets(secrets, imageConfig.secrets)
    }

    return {
      ...config,
      secrets,
    }
  }

  instanceContainerConfigDataToDb(
    config: InstanceContainerConfigData,
  ): Omit<InstanceContainerConfig, 'id' | 'instanceId'> {
    return this.imageMapper.containerConfigDataToDb(config)
  }

  eventToProto(event: DeploymentEvent): DeploymentEventResponse {
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
        deploymentStatus = this.statusToProto(event.value as DeploymentStatusEnum)
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
      type: this.eventTypeToProto(event.type),
      log,
      deploymentStatus,
      containerStatus,
    }
  }

  eventTypeToProto(type: DeploymentEventTypeEnum) {
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

  statusToProto(status: DeploymentStatusEnum): DeploymentStatus {
    switch (status) {
      case DeploymentStatusEnum.inProgress:
        return DeploymentStatus.IN_PROGRESS
      default:
        return deploymentStatusFromJSON(status.toUpperCase())
    }
  }

  containerStateToProto(state?: ContainerStateEnum): ContainerState {
    return state ? containerStateFromJSON(state.toUpperCase()) : null
  }

  containerStateToDb(state?: ContainerState): ContainerStateEnum {
    return state ? (containerStateToJSON(state).toLowerCase() as ContainerStateEnum) : null
  }

  configToAgentCommonConfig(config: MergedContainerConfigData): CommonContainerConfig {
    return {
      name: config.name,
      environment: this.jsonToPipedFormat(config.environment),
      secrets: this.mapKeyValueToMap(config.secrets),
      commands: this.mapUniqueKeyToStringArray(config.commands),
      expose: this.imageMapper.exposeStrategyToProto(config.expose),
      args: this.mapUniqueKeyToStringArray(config.args),
      TTY: config.tty,
      configContainer: config.configContainer,
      importContainer: config.importContainer
        ? {
            ...config.importContainer,
            environment: this.mapKeyValueToMap(config.importContainer?.environment),
          }
        : null,
      ingress: config.ingress,
      initContainers: this.mapInitContainerToAgent(config.initContainers),
      portRanges: config.portRanges,
      ports: config.ports,
      user: config.user,
      volumes: this.imageMapper.volumesToProto(config.volumes),
    }
  }

  configToAgentDagentConfig(config: MergedContainerConfigData): DagentContainerConfig {
    return {
      networks: this.mapUniqueKeyToStringArray(config.networks),
      logConfig: !config.logConfig
        ? null
        : {
            ...config.logConfig,
            driver: this.imageMapper.logDriverToProto(config.logConfig.driver),
            options: this.mapKeyValueToMap(config.logConfig.options),
          },
      networkMode: this.imageMapper.networkModeToProto(config.networkMode),
      restartPolicy: this.imageMapper.restartPolicyToProto(config.restartPolicy),
      labels: this.mapKeyValueToMap(config.dockerLabels),
    }
  }

  configToAgentCraneConfig(config: MergedContainerConfigData): CraneContainerConfig {
    return {
      customHeaders: this.mapUniqueKeyToStringArray(config.customHeaders),
      extraLBAnnotations: this.mapKeyValueToMap(config.extraLBAnnotations),
      deploymentStatregy: this.imageMapper.deploymentStrategyToProto(config.deploymentStrategy),
      healthCheckConfig: config.healthCheckConfig,
      proxyHeaders: config.proxyHeaders,
      useLoadBalancer: config.useLoadBalancer,
      resourceConfig: {
        limits: config.resourceConfig?.limits,
        requests: config.resourceConfig?.requests,
      },
      labels: config.labels
        ? {
            deployment: this.mapKeyValueToMap(config.labels?.deployment),
            ingress: this.mapKeyValueToMap(config.labels?.ingress),
            service: this.mapKeyValueToMap(config.labels?.service),
          }
        : null,
      annotations: config.annotations
        ? {
            deployment: this.mapKeyValueToMap(config.annotations?.deployment),
            ingress: this.mapKeyValueToMap(config.annotations?.ingress),
            service: this.mapKeyValueToMap(config.annotations?.service),
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

  private mergeSecrets(
    instanceSecrets: UniqueSecretKeyValue[],
    imageSecrets: UniqueSecretKey[],
  ): UniqueSecretKeyValue[] {
    instanceSecrets = instanceSecrets ?? []

    const overriddenIds: Set<string> = new Set(instanceSecrets?.map(it => it.id))

    const missing: UniqueSecretKeyValue[] = imageSecrets
      .filter(it => !overriddenIds.has(it.id))
      .map(it => ({
        ...it,
        value: '',
        encrypted: false,
        publicKey: null,
      }))

    return [...missing, ...instanceSecrets]
  }

  public mergeConfigs(image: ContainerConfigData, instance: InstanceContainerConfigData): MergedContainerConfigData {
    return {
      // common
      name: instance.name ?? image.name,
      environment: instance.environment ?? image.environment,
      secrets: this.mergeSecrets(instance.secrets, image.secrets),
      user: instance.user ?? image.user,
      tty: instance.tty ?? image.tty,
      portRanges: instance.portRanges ?? image.portRanges,
      args: instance.args ?? image.args,
      commands: instance.commands ?? image.commands,
      expose: instance.expose ?? image.expose,
      configContainer: instance.configContainer ?? image.configContainer,
      ingress: instance.ingress ?? image.ingress,
      volumes: instance.volumes ?? image.volumes,
      importContainer: instance.importContainer ?? image.importContainer,
      initContainers: instance.initContainers ?? image.initContainers,
      capabilities: [], // TODO (@m8vago, @nandor-magyar): caps
      ports: instance.ports ?? image.ports,

      // crane
      customHeaders: instance.customHeaders ?? image.customHeaders,
      proxyHeaders: instance.proxyHeaders ?? image.proxyHeaders,
      extraLBAnnotations: instance.extraLBAnnotations ?? image.extraLBAnnotations,
      healthCheckConfig: instance.healthCheckConfig ?? image.healthCheckConfig,
      resourceConfig: instance.resourceConfig ?? image.resourceConfig,
      useLoadBalancer: instance.useLoadBalancer ?? image.useLoadBalancer,
      deploymentStrategy: instance.deploymentStrategy ?? image.deploymentStrategy,
      labels:
        instance.labels || image.labels
          ? {
              deployment: instance.labels?.deployment ?? image.labels?.deployment ?? [],
              service: instance.labels?.service ?? image.labels?.service ?? [],
              ingress: instance.labels?.ingress ?? image.labels?.ingress ?? [],
            }
          : null,
      annotations:
        image.annotations || instance.annotations
          ? {
              deployment: instance.annotations?.deployment ?? image.annotations?.deployment ?? [],
              service: instance.annotations?.service ?? image.annotations?.service ?? [],
              ingress: instance.annotations?.ingress ?? image.annotations?.ingress ?? [],
            }
          : null,

      // dagent
      logConfig: instance.logConfig ?? image.logConfig,
      networkMode: instance.networkMode ?? image.networkMode,
      restartPolicy: instance.restartPolicy ?? image.restartPolicy,
      networks: instance.networks ?? image.networks,
      dockerLabels: instance.dockerLabels ?? image.dockerLabels,
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
