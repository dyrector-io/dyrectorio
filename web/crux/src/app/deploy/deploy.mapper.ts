import { Inject, Injectable, forwardRef } from '@nestjs/common'
import {
  Deployment,
  DeploymentEvent,
  DeploymentEventTypeEnum,
  DeploymentStatusEnum,
  InstanceContainerConfig,
  Storage,
} from '@prisma/client'
import {
  ContainerConfigData,
  ContainerState,
  InitContainer,
  InstanceContainerConfigData,
  MergedContainerConfigData,
  UniqueKey,
  UniqueKeyValue,
} from 'src/domain/container'
import { deploymentLogLevelToDb, deploymentStatusToDb } from 'src/domain/deployment'
import { CruxInternalServerErrorException } from 'src/exception/crux-exception'
import {
  InitContainer as AgentInitContainer,
  CommonContainerConfig,
  CraneContainerConfig,
  DagentContainerConfig,
  ImportContainer,
  InstanceConfig,
} from 'src/grpc/protobuf/proto/agent'
import {
  DeploymentStatusMessage,
  KeyValue,
  ListSecretsResponse,
  ContainerState as ProtoContainerState,
  DeploymentStrategy as ProtoDeploymentStrategy,
  ExposeStrategy as ProtoExposeStrategy,
  containerStateToJSON,
} from 'src/grpc/protobuf/proto/common'
import EncryptionService from 'src/services/encryption.service'
import AuditMapper from '../audit/audit.mapper'
import ContainerMapper from '../container/container.mapper'
import ImageMapper from '../image/image.mapper'
import { NodeConnectionStatus } from '../node/node.dto'
import NodeMapper from '../node/node.mapper'
import ProjectMapper from '../project/project.mapper'
import VersionMapper from '../version/version.mapper'
import {
  DeploymentDetails,
  DeploymentDetailsDto,
  DeploymentDto,
  DeploymentEventDto,
  DeploymentEventLogDto,
  DeploymentEventTypeDto,
  DeploymentLogLevelDto,
  DeploymentStatusDto,
  DeploymentWithBasicNodeDto,
  DeploymentWithNode,
  DeploymentWithNodeVersion,
  EnvironmentToConfigBundleNameMap,
  InstanceContainerConfigDto,
  InstanceDetails,
  InstanceDto,
  InstanceSecretsDto,
} from './deploy.dto'
import { DeploymentEventMessage } from './deploy.message'

@Injectable()
export default class DeployMapper {
  constructor(
    @Inject(forwardRef(() => ImageMapper))
    private imageMapper: ImageMapper,
    private containerMapper: ContainerMapper,
    @Inject(forwardRef(() => ProjectMapper))
    private projectMapper: ProjectMapper,
    private auditMapper: AuditMapper,
    @Inject(forwardRef(() => VersionMapper))
    private versionMapper: VersionMapper,
    @Inject(forwardRef(() => NodeMapper))
    private nodeMapper: NodeMapper,
    private encryptionService: EncryptionService,
  ) {}

  statusToDto(it: DeploymentStatusEnum): DeploymentStatusDto {
    switch (it) {
      case 'inProgress':
        return 'in-progress'
      default:
        return it as DeploymentStatusDto
    }
  }

  toDeploymentWithBasicNodeDto(it: DeploymentWithNode, nodeStatus: NodeConnectionStatus): DeploymentWithBasicNodeDto {
    return {
      id: it.id,
      prefix: it.prefix,
      protected: it.protected,
      status: this.statusToDto(it.status),
      updatedAt: it.updatedAt ?? it.createdAt,
      node: this.nodeMapper.toBasicWithStatusDto(it.node, nodeStatus),
    }
  }

  toDto(it: DeploymentWithNodeVersion): DeploymentDto {
    return {
      id: it.id,
      prefix: it.prefix,
      protected: it.protected,
      note: it.note,
      status: this.statusToDto(it.status),
      audit: this.auditMapper.toDto(it),
      node: this.nodeMapper.toBasicDto(it.node),
      project: this.projectMapper.toBasicDto(it.version.project),
      version: this.versionMapper.toBasicDto(it.version),
    }
  }

  toDetailsDto(
    deployment: DeploymentDetails,
    publicKey?: string,
    configBundleEnvironment?: EnvironmentToConfigBundleNameMap,
  ): DeploymentDetailsDto {
    return {
      ...this.toDto(deployment),
      token: deployment.tokens.length > 0 ? deployment.tokens[0] : null,
      lastTry: deployment.tries,
      publicKey,
      configBundleIds: deployment.configBundles.map(it => it.configBundle.id),
      environment: deployment.environment as UniqueKeyValue[],
      instances: deployment.instances.map(it => this.instanceToDto(it)),
      configBundleEnvironment: configBundleEnvironment ?? {},
    }
  }

  instanceToDto(it: InstanceDetails): InstanceDto {
    return {
      id: it.id,
      updatedAt: it.updatedAt,
      image: this.imageMapper.toDto(it.image),
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
      ...this.containerMapper.configDataToDto(it as ContainerConfigData),
      secrets: it.secrets,
    }
  }

  instanceConfigDtoToInstanceContainerConfigData(
    imageConfig: ContainerConfigData,
    currentConfig: InstanceContainerConfigData,
    patch: InstanceContainerConfigDto,
  ): InstanceContainerConfigData {
    const config = this.containerMapper.configDtoToConfigData(currentConfig as ContainerConfigData, patch)

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

    let secrets = !patch.secrets ? currentConfig.secrets : patch.secrets
    if (secrets && !currentConfig.secrets && imageConfig.secrets) {
      secrets = this.containerMapper.mergeSecrets(secrets, imageConfig.secrets)
    }

    return {
      ...config,
      secrets,
    }
  }

  instanceConfigDataToDb(config: InstanceContainerConfigData): Omit<InstanceContainerConfig, 'id' | 'instanceId'> {
    const imageConfig = this.containerMapper.configDataToDb(config)
    return {
      ...imageConfig,
      tty: config.tty,
      useLoadBalancer: config.useLoadBalancer,
      proxyHeaders: config.proxyHeaders,
    }
  }

  eventTypeToDto(it: DeploymentEventTypeEnum): DeploymentEventTypeDto {
    switch (it) {
      case 'deploymentStatus':
        return 'deployment-status'
      case 'containerState':
        return 'container-state'
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
        const value = event.value as { log: string[]; level: DeploymentLogLevelDto }
        result.log = value as DeploymentEventLogDto
        break
      }
      case DeploymentEventTypeEnum.deploymentStatus: {
        result.deploymentStatus = this.statusToDto(event.value as DeploymentStatusEnum)
        break
      }
      case DeploymentEventTypeEnum.containerState: {
        const value = event.value as { instanceId: string; state: ContainerState }
        result.containerState = value
        break
      }
      default:
        throw new CruxInternalServerErrorException({
          message: 'Unsupported deployment event type!',
        })
    }

    return result
  }

  progressEventToEventDto(message: DeploymentStatusMessage): DeploymentEventMessage[] {
    const events: DeploymentEventMessage[] = []
    if (message.log) {
      events.push({
        type: 'log',
        createdAt: new Date(),
        log: {
          log: message.log,
          level: deploymentLogLevelToDb(message.logLevel),
        },
      })
    }

    if (message.deploymentStatus) {
      events.push({
        type: 'deployment-status',
        createdAt: new Date(),
        deploymentStatus: this.statusToDto(deploymentStatusToDb(message.deploymentStatus)),
      })
    }

    if (message.instance) {
      events.push({
        type: 'container-state',
        createdAt: new Date(),
        containerState: {
          instanceId: message.instance.instanceId,
          state: this.containerStateToDto(message.instance.state),
        },
      })
    }

    if (message.containerProgress) {
      const progress = Math.max(0, Math.min(1, message.containerProgress.progress ?? 0))
      events.push({
        type: 'container-progress',
        createdAt: new Date(),
        containerProgress: {
          instanceId: message.containerProgress.instanceId,
          status: message.containerProgress.status,
          progress,
        },
      })
    }

    return events
  }

  deploymentToAgentInstanceConfig(deployment: Deployment, mergedEnvironment: UniqueKeyValue[]): InstanceConfig {
    const environmentMap = this.mapKeyValueToMap(mergedEnvironment)

    return {
      prefix: deployment.prefix,
      environment: environmentMap,
    }
  }

  containerStateToDto(state?: ProtoContainerState): ContainerState {
    return state ? (containerStateToJSON(state).toLowerCase() as ContainerState) : null
  }

  commonConfigToAgentProto(config: MergedContainerConfigData, storage?: Storage): CommonContainerConfig {
    return {
      name: config.name,
      environment: this.mapKeyValueToMap(config.environment),
      secrets: this.mapKeyValueToMap(config.secrets),
      commands: this.mapUniqueKeyToStringArray(config.commands),
      expose: this.imageMapper.exposeStrategyToProto(config.expose) ?? ProtoExposeStrategy.NONE_ES,
      args: this.mapUniqueKeyToStringArray(config.args),
      // Set user to the given value, if not null or use 0 if specifically 0, otherwise set null
      user: config.user === -1 ? null : config.user,
      workingDirectory: config.workingDirectory,
      TTY: config.tty,
      configContainer: config.configContainer,
      importContainer: config.storageId ? this.storageToImportContainer(config, storage) : null,
      routing: config.routing,
      initContainers: this.mapInitContainerToAgent(config.initContainers),
      portRanges: config.portRanges,
      ports: config.ports,
      volumes: this.imageMapper.volumesToProto(config.volumes ?? []),
      expectedState: this.imageMapper.expectedStateToProto(config.expectedState),
    }
  }

  dagentConfigToAgentProto(config: MergedContainerConfigData): DagentContainerConfig {
    return {
      networks: this.mapUniqueKeyToStringArray(config.networks),
      logConfig:
        !config.logConfig || config.logConfig.driver === 'nodeDefault'
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
      deploymentStrategy:
        this.imageMapper.deploymentStrategyToProto(config.deploymentStrategy) ?? ProtoDeploymentStrategy.ROLLING_UPDATE,
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
      metrics: config.metrics?.enabled
        ? {
            path: config.metrics.path ?? null,
            port: config.metrics.port?.toString() ?? null,
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

  private storageToImportContainer(config: MergedContainerConfigData, storage: Storage): ImportContainer {
    const url = /^(http)s?/.test(storage.url) ? storage.url : `https://${storage.url}`
    let environment: { [key: string]: string } = {
      RCLONE_CONFIG_S3_TYPE: 's3',
      RCLONE_CONFIG_S3_PROVIDER: 'Other',
      RCLONE_CONFIG_S3_ENDPOINT: url,
    }
    if (storage.accessKey && storage.secretKey) {
      environment = {
        ...environment,
        RCLONE_CONFIG_S3_ACCESS_KEY_ID: this.encryptionService.decrypt(storage.accessKey),
        RCLONE_CONFIG_S3_SECRET_ACCESS_KEY: this.encryptionService.decrypt(storage.secretKey),
      }
    }

    return {
      volume: config.storageConfig?.path ?? '',
      command: `sync s3:${config.storageConfig?.bucket ?? ''} /data/output`,
      environment,
    }
  }
}
