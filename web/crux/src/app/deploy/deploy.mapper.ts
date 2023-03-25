import { Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  ContainerStateEnum,
  Deployment,
  DeploymentEvent,
  DeploymentEventTypeEnum,
  DeploymentStatusEnum,
  Instance,
  InstanceContainerConfig,
  Node,
  Product,
  Storage,
  Version,
} from '@prisma/client'
import {
  CommonContainerConfig,
  CraneContainerConfig,
  DagentContainerConfig,
  ImportContainer,
  InitContainer as AgentInitContainer,
  InstanceConfig,
} from 'src/grpc/protobuf/proto/agent'
import {
  ContainerState,
  containerStateFromJSON,
  containerStateToJSON,
  DeploymentStatus,
  deploymentStatusFromJSON,
  DeploymentStrategy as ProtoDeploymentStrategy,
  ExposeStrategy as ProtoExposeStrategy,
  KeyValue,
  ListSecretsResponse,
} from 'src/grpc/protobuf/proto/common'
import {
  AuditResponse,
  InitContainer,
  InstanceContainerConfig as ProtoInstanceContainerConfig,
  InstanceResponse,
} from 'src/grpc/protobuf/proto/crux'
import {
  ContainerConfigData,
  InstanceContainerConfigData,
  MergedContainerConfigData,
  UniqueKey,
  UniqueKeyValue,
} from 'src/shared/models'
import ImageMapper, { ImageDetails } from '../image/image.mapper'
import ContainerMapper from '../shared/container.mapper'
import { BasicProperties } from '../shared/shared.dto'
import SharedMapper from '../shared/shared.mapper'
import {
  DeploymentDetailsDto,
  DeploymentDto,
  DeploymentEventDto,
  DeploymentEventTypeDto,
  DeploymentStatusDto,
  DeploymentWithBasicNodeDto,
  InstanceContainerConfigDto,
  InstanceDto,
  InstanceSecretsDto,
} from './deploy.dto'

@Injectable()
export default class DeployMapper {
  constructor(
    private sharedMapper: SharedMapper,
    private imageMapper: ImageMapper,
    private containerMapper: ContainerMapper,
  ) {}

  statusToDto(it: DeploymentStatusEnum): DeploymentStatusDto {
    switch (it) {
      case 'inProgress':
        return 'in-progress'
      default:
        return it as DeploymentStatusDto
    }
  }

  toDeploymentWithBasicNodeDto(it: DeploymentWithNode): DeploymentWithBasicNodeDto {
    return {
      id: it.id,
      prefix: it.prefix,
      status: this.statusToDto(it.status),
      updatedAt: it.updatedAt ?? it.createdAt,
      node: this.sharedMapper.nodeToBasicDto(it.node),
    }
  }

  toDto(it: DeploymentWithNodeVersion): DeploymentDto {
    return {
      id: it.id,
      prefix: it.prefix,
      status: this.statusToDto(it.status),
      audit: this.sharedMapper.auditToDto(it),
      node: this.sharedMapper.nodeToBasicDto(it.node),
      product: this.sharedMapper.productToBasicDto(it.version.product),
      version: this.sharedMapper.versionToBasicDto(it.version),
    }
  }

  toDetailsDto(deployment: DeploymentDetails, publicKey?: string): DeploymentDetailsDto {
    return {
      ...this.toDto(deployment),
      publicKey,
      environment: deployment.environment as UniqueKeyValue[],
      instances: deployment.instances.map(it => this.instanceToDto(it)),
    }
  }

  instanceToDto(it: InstanceDetails): InstanceDto {
    return {
      id: it.id,
      updatedAt: it.updatedAt,
      image: this.imageMapper.toDto(it.image),
      state: it.state,
      config: this.instanceConfigToDto(it.config as any as InstanceContainerConfigData),
    }
  }

  secretsResponseToInstanceSecretsDto(it: ListSecretsResponse): InstanceSecretsDto {
    return {
      container: {
        prefix: it.prefix,
        name: it.name,
      },
      publicKey: it.publicKey,
      keys: !it.hasKeys ? null : it.keys,
    }
  }

  instanceConfigToDto(it?: InstanceContainerConfigData): InstanceContainerConfigDto {
    if (!it) {
      return null
    }

    return {
      ...this.imageMapper.containerConfigDataToDto(it as ContainerConfigData),
      secrets: it.secrets,
    }
  }

  instanceConfigDtoToInstanceContainerConfigData(
    imageConfig: ContainerConfigData,
    currentConfig: InstanceContainerConfigData,
    patch: InstanceContainerConfigDto,
  ): InstanceContainerConfigData {
    const config = this.imageMapper.configDtoToContainerConfigData(currentConfig as ContainerConfigData, patch)

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

    let secrets = !patch.secrets ? undefined : patch.secrets
    if (secrets && !currentConfig.secrets && imageConfig.secrets) {
      secrets = this.containerMapper.mergeSecrets(secrets, imageConfig.secrets)
    }

    return {
      ...config,
      secrets,
    }
  }

  instanceConfigDataToDb(config: InstanceContainerConfigData): Omit<InstanceContainerConfig, 'id' | 'instanceId'> {
    const imageConfig = this.imageMapper.containerConfigDataToDb(config)
    return {
      ...imageConfig,
      tty: config.tty,
      useLoadBalancer: config.useLoadBalancer,
      proxyHeaders: config.proxyHeaders,
    }
  }

  instanceContainerConfigDataToDb(
    config: InstanceContainerConfigData,
  ): Omit<InstanceContainerConfig, 'id' | 'instanceId'> {
    return this.imageMapper.containerConfigDataToDb(config)
  }

  eventTypeToDto(it: DeploymentEventTypeEnum): DeploymentEventTypeDto {
    switch (it) {
      case 'deploymentStatus':
        return 'deployment-status'
      case 'containerStatus':
        return 'container-status'
      default:
        return it as DeploymentEventTypeDto
    }
  }

  eventToDto(event: DeploymentEvent): DeploymentEventDto {
    const result: DeploymentEventDto = {
      createdAt: event.createdAt,
      type: this.eventTypeToDto(event.type),
    }

    switch (event.type) {
      case DeploymentEventTypeEnum.log: {
        result.log = event.value as string[]
        break
      }
      case DeploymentEventTypeEnum.deploymentStatus: {
        result.deploymentStatus = this.statusToDto(event.value as DeploymentStatusEnum)
        break
      }
      // TODO(@m8vago): rename to containerState
      case DeploymentEventTypeEnum.containerStatus: {
        const value = event.value as { instanceId: string; state: ContainerStateEnum }
        result.containerState = value
        break
      }
      default:
        throw new InternalServerErrorException({
          message: 'Unsupported deployment event type!',
        })
    }

    return result
  }

  instanceToProto(instance: InstanceDetails): InstanceResponse {
    return {
      ...instance,
      audit: AuditResponse.fromJSON(instance),
      image: this.imageMapper.detailsToProto(instance.image),
      state: this.containerStateToProto(instance.state),
      config: this.instanceConfigToProto((instance.config ?? {}) as InstanceContainerConfigData),
    }
  }

  instanceConfigToProto(config: InstanceContainerConfigData): ProtoInstanceContainerConfig {
    return {
      common: this.imageMapper.commonConfigToProto(config),
      dagent: this.imageMapper.dagentConfigToProto(config),
      crane: this.imageMapper.craneConfigToProto(config),
      secrets: !config.secrets ? null : { data: config.secrets },
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

  commonConfigToAgentProto(config: MergedContainerConfigData, storage?: Storage): CommonContainerConfig {
    return {
      name: config.name,
      environment: this.jsonToPipedFormat(config.environment),
      secrets: this.mapKeyValueToMap(config.secrets),
      commands: this.mapUniqueKeyToStringArray(config.commands),
      expose: this.imageMapper.exposeStrategyToProto(config.expose) ?? ProtoExposeStrategy.NONE_ES,
      args: this.mapUniqueKeyToStringArray(config.args),
      TTY: config.tty,
      configContainer: config.configContainer,
      importContainer: config.storageId ? this.storageToImportContainer(config, storage) : null,
      ingress: config.ingress,
      initContainers: this.mapInitContainerToAgent(config.initContainers),
      portRanges: config.portRanges,
      ports: config.ports,
      user: config.user,
      volumes: this.imageMapper.volumesToProto(config.volumes ?? []),
    }
  }

  dagentConfigToAgentProto(config: MergedContainerConfigData): DagentContainerConfig {
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

  craneConfigToAgentProto(config: MergedContainerConfigData): CraneContainerConfig {
    return {
      customHeaders: this.mapUniqueKeyToStringArray(config.customHeaders),
      extraLBAnnotations: this.mapKeyValueToMap(config.extraLBAnnotations),
      deploymentStatregy:
        this.imageMapper.deploymentStrategyToProto(config.deploymentStrategy) ?? ProtoDeploymentStrategy.ROLLING,
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
        command: it.command?.map(cit => cit.key) ?? [],
        args: it.args?.map(ait => ait.key) ?? [],
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

  private storageToImportContainer(config: MergedContainerConfigData, storage: Storage): ImportContainer {
    let environment: { [key: string]: string } = {
      RCLONE_CONFIG_S3_TYPE: 's3',
      RCLONE_CONFIG_S3_PROVIDER: 'Other',
      RCLONE_CONFIG_S3_ENDPOINT: storage.url,
    }
    if (storage.accessKey && storage.secretKey) {
      environment = {
        ...environment,
        RCLONE_CONFIG_S3_ACCESS_KEY_ID: storage.accessKey,
        RCLONE_CONFIG_S3_SECRET_ACCESS_KEY: storage.secretKey,
      }
    }

    return {
      volume: config.storageConfig?.path ?? '',
      command: `sync s3:${config.storageConfig?.bucket ?? ''} /data/output`,
      environment,
    }
  }
}

export type DeploymentWithNode = Deployment & {
  node: Pick<Node, BasicProperties>
}

type DeploymentWithNodeVersion = DeploymentWithNode & {
  version: Pick<Version, BasicProperties> & {
    product: Pick<Product, BasicProperties>
  }
}

export type InstanceDetails = Instance & {
  image: ImageDetails
  config?: InstanceContainerConfig
}

export type DeploymentDetails = DeploymentWithNodeVersion & {
  instances: InstanceDetails[]
}
