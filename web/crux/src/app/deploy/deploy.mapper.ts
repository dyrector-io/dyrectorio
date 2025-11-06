import { Inject, Injectable, forwardRef } from '@nestjs/common'
import {
  ContainerConfig,
  Deployment,
  DeploymentEvent,
  DeploymentEventTypeEnum,
  DeploymentStatusEnum,
  DeploymentStrategy,
  ExposeStrategy,
  NetworkMode,
  RestartPolicy,
  Storage,
  VersionTypeEnum,
} from '@prisma/client'
import {
  ConcreteContainerConfigData,
  ContainerConfigData,
  ContainerLogDriverType,
  ContainerState,
  ContainerVolumeType,
  HealthCheck,
  HealthCheckProbe,
  InitContainer,
  UniqueKey,
  UniqueKeyValue,
  Volume,
} from 'src/domain/container'
import { mergeMarkers, mergeSecrets } from 'src/domain/container-merge'
import {
  DeploymentDetails,
  DeploymentWithConfigAndBundles,
  DeploymentWithNode,
  DeploymentWithNodeVersion,
  InstanceDetails,
  deploymentLogLevelToDb,
  deploymentStatusToDb,
} from 'src/domain/deployment'
import {
  DeploymentConfigBundlesUpdatedEvent,
  InstanceDeletedEvent,
  InstancesCreatedEvent,
} from 'src/domain/domain-events'
import { ImageDetails } from 'src/domain/image'
import { DeployableDeployment } from 'src/domain/start-deployment'
import { CopiedDeployment } from 'src/domain/version-increase'
import { CruxInternalServerErrorException } from 'src/exception/crux-exception'
import {
  InitContainer as AgentInitContainer,
  CommonContainerConfig,
  CraneContainerConfig,
  DagentContainerConfig,
  ImportContainer,
  Volume as ProtoVolume,
} from 'src/grpc/protobuf/proto/agent'
import {
  ContainerState as ProtoContainerState,
  DeploymentStatusMessage as ProtoDeploymentStatusMessage,
  DeploymentStrategy as ProtoDeploymentStrategy,
  DriverType as ProtoDriverType,
  ExposeStrategy as ProtoExposeStrategy,
  HealthCheckConfig as ProtoHealthCheckConfig,
  ListSecretsResponse as ProtoListSecretsResponse,
  NetworkMode as ProtoNetworkMode,
  Probe as ProtoProbe,
  RestartPolicy as ProtoRestartPolicy,
  VolumeType as ProtoVolumeType,
  containerStateToJSON,
  driverTypeFromJSON,
  networkModeFromJSON,
  probeTypeFromJSON,
  volumeTypeFromJSON,
} from 'src/grpc/protobuf/proto/common'
import EncryptionService from 'src/services/encryption.service'
import AgentService from '../agent/agent.service'
import AuditMapper from '../audit/audit.mapper'
import ConfigBundleMapper from '../config.bundle/config.bundle.mapper'
import { ConcreteContainerConfigDataDto, ConcreteContainerConfigDto } from '../container/container.dto'
import ContainerMapper from '../container/container.mapper'
import ImageMapper from '../image/image.mapper'
import { NodeConnectionStatus } from '../node/node.dto'
import NodeMapper from '../node/node.mapper'
import ProjectMapper from '../project/project.mapper'
import VersionMapper from '../version/version.mapper'
import {
  BasicDeploymentDto,
  DeploymentDetailsDto,
  DeploymentDto,
  DeploymentEventDto,
  DeploymentEventLogDto,
  DeploymentEventTypeDto,
  DeploymentLogLevelDto,
  DeploymentSecretsDto,
  DeploymentStatusDto,
  DeploymentWithBasicNodeDto,
  DeploymentWithConfigDto,
  InstanceDetailsDto,
  InstanceSecretsDto,
} from './deploy.dto'
import {
  DeploymentBundlesUpdatedMessage,
  DeploymentEventMessage,
  InstanceDeletedMessage,
  InstancesAddedMessage,
} from './deploy.message'

@Injectable()
export default class DeployMapper {
  constructor(
    @Inject(forwardRef(() => AgentService))
    private readonly agentService: AgentService,
    private readonly imageMapper: ImageMapper,
    @Inject(forwardRef(() => ContainerMapper))
    private readonly containerMapper: ContainerMapper,
    private readonly projectMapper: ProjectMapper,
    private readonly auditMapper: AuditMapper,
    private readonly versionMapper: VersionMapper,
    private readonly nodeMapper: NodeMapper,
    @Inject(forwardRef(() => ConfigBundleMapper))
    private readonly configBundleMapper: ConfigBundleMapper,
    private readonly encryptionService: EncryptionService,
  ) {}

  statusToDto(it: DeploymentStatusEnum): DeploymentStatusDto {
    switch (it) {
      case 'inProgress':
        return 'in-progress'
      default:
        return it as DeploymentStatusDto
    }
  }

  statusDtoToDb(it: DeploymentStatusDto): DeploymentStatusEnum {
    switch (it) {
      case 'in-progress':
        return 'inProgress'
      default:
        return it as DeploymentStatusEnum
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
      audit: this.auditMapper.toDto(it),
    }
  }

  toBasicDto(it: Deployment): BasicDeploymentDto {
    return {
      id: it.id,
      prefix: it.prefix,
      protected: it.protected,
      status: this.statusToDto(it.status),
      audit: this.auditMapper.toDto(it),
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

  toDeploymentWithConfigDto(deployment: DeploymentWithConfigAndBundles): DeploymentWithConfigDto {
    const agent = this.agentService.getById(deployment.nodeId)

    return {
      ...this.toDto(deployment),
      publicKey: agent?.publicKey ?? null,
      configBundles: deployment.configBundles.map(it => this.configBundleMapper.detailsToDto(it.configBundle)),
      config: this.concreteConfigToDto(deployment.config),
    }
  }

  toDetailsDto(deployment: DeploymentDetails): DeploymentDetailsDto {
    return {
      ...this.toDeploymentWithConfigDto(deployment),
      token: deployment.token ?? null,
      lastTry: deployment.tries,
      instances: deployment.instances.map(it => this.instanceToDto(it)),
    }
  }

  instanceToDto(it: InstanceDetails): InstanceDetailsDto {
    return {
      id: it.id,
      updatedAt: it.config.updatedAt,
      image: this.imageMapper.toDetailsDto(it.image),
      config: this.concreteConfigToDto(it.config),
    }
  }

  secretsResponseToDeploymentSecretsDto(it: ProtoListSecretsResponse): DeploymentSecretsDto {
    return {
      publicKey: it.publicKey,
      keys: it.keys,
    }
  }

  secretsResponseToInstanceSecretsDto(it: ProtoListSecretsResponse): InstanceSecretsDto {
    return {
      ...this.secretsResponseToDeploymentSecretsDto(it),
      container: it.target.container,
    }
  }

  concreteConfigToDto(config: ContainerConfig): ConcreteContainerConfigDto {
    return this.containerMapper.configDataToDto(config) as ConcreteContainerConfigDto
  }

  copiedDeploymentToCreateDeploymentStatement(
    deployment: CopiedDeployment,
  ): Omit<Deployment, 'id' | 'nodeId' | 'versionId' | 'configId'> {
    const result = {
      ...deployment,
    }

    delete result.nodeId

    return result
  }

  dbDeploymentToCreateDeploymentStatement(
    deployment: Deployment,
  ): Omit<Deployment, 'id' | 'nodeId' | 'versionId' | 'configId'> {
    const result = {
      ...deployment,
    }

    delete result.id
    delete result.nodeId
    delete result.versionId
    delete result.configId

    return result
  }

  dbDeploymentToDeployableDeployment(deployment: DbDeployableDeployment): DeployableDeployment {
    return {
      ...deployment,
      config: this.containerMapper.dbConfigToContainerConfigData(deployment.config),
      configBundles: deployment.configBundles.map(bundleConnection => {
        const bundleConfig: ContainerConfigData = this.containerMapper.dbConfigToContainerConfigData(
          bundleConnection.configBundle.config,
        )
        return {
          ...bundleConnection,
          configBundle: {
            config: {
              ...bundleConfig,
              id: bundleConnection.configBundle.config.id,
            },
          },
        }
      }),
      instances: deployment.instances.map(instance => {
        const imageConf: ContainerConfigData = this.containerMapper.dbConfigToContainerConfigData(instance.image.config)
        const instanceConf: ConcreteContainerConfigData = this.containerMapper.dbConfigToContainerConfigData(
          instance.config,
        )
        return {
          id: instance.id,
          config: instanceConf,
          configId: instance.configId,
          image: {
            ...instance.image,
            config: imageConf,
          },
        }
      }),
    }
  }

  concreteConfigDtoToConcreteContainerConfigData(
    baseConfig: ContainerConfigData,
    concreteConfig: ConcreteContainerConfigData,
    patch: ConcreteContainerConfigDataDto,
  ): ConcreteContainerConfigData {
    const config = this.containerMapper.configDtoToConfigData(concreteConfig, patch)

    if ('labels' in patch) {
      const currentLabels = concreteConfig.labels ?? baseConfig.labels ?? {}
      config.labels = mergeMarkers(config.labels, currentLabels)
    }

    if ('annotations' in patch) {
      const currentAnnotations = concreteConfig.annotations ?? baseConfig.annotations ?? {}
      config.annotations = mergeMarkers(config.annotations, currentAnnotations)
    }

    if ('secrets' in patch) {
      // when they are already overridden, we simply use the patch
      // otherwise we need to merge with them with the image secrets
      return {
        ...config,
        secrets: concreteConfig.secrets ? patch.secrets : mergeSecrets(patch.secrets, baseConfig.secrets),
      }
    }

    return config
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

  progressEventToEventDto(message: ProtoDeploymentStatusMessage): DeploymentEventMessage[] {
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

  containerStateToDto(state?: ProtoContainerState): ContainerState {
    return state ? (containerStateToJSON(state).toLowerCase() as ContainerState) : null
  }

  commonConfigToAgentProto(config: ConcreteContainerConfigData, storage: Storage): CommonContainerConfig {
    return {
      name: config.name,
      environment: this.mapKeyValueToMap(config.environment),
      secrets: this.mapKeyValueToMap(config.secrets),
      commands: this.mapUniqueKeyToStringArray(config.commands),
      expose: this.exposeStrategyToProto(config.expose),
      args: this.mapUniqueKeyToStringArray(config.args),
      user: config.user,
      workingDirectory: config.workingDirectory,
      TTY: config.tty,
      configContainer: config.configContainer,
      importContainer: config.storageSet ? this.storageToImportContainer(config, storage) : null,
      routing: config.routing,
      initContainers: this.mapInitContainerToAgent(config.initContainers),
      portRanges: config.portRanges ?? [],
      ports: config.ports ?? [],
      volumes: this.volumesToProto(config.volumes),
      resourceConfig: {
        limits: config.resourceConfig?.limits,
        requests: config.resourceConfig?.requests,
      },
    }
  }

  dagentConfigToAgentProto(config: ConcreteContainerConfigData): DagentContainerConfig {
    return {
      networks: this.mapUniqueKeyToStringArray(config.networks),
      logConfig:
        !config.logConfig || config.logConfig.driver === 'nodeDefault'
          ? null
          : {
              ...config.logConfig,
              driver: this.logDriverToProto(config.logConfig.driver),
              options: this.mapKeyValueToMap(config.logConfig.options),
            },
      networkMode: this.networkModeToProto(config.networkMode),
      restartPolicy: this.restartPolicyToProto(config.restartPolicy),
      labels: this.mapKeyValueToMap(config.dockerLabels),
      expectedState: !config.expectedState
        ? null
        : {
            state: this.stateToProto(config.expectedState.state),
            timeout: config.expectedState.timeout,
            exitCode: config.expectedState.exitCode,
          },
    }
  }

  craneConfigToAgentProto(config: ConcreteContainerConfigData): CraneContainerConfig {
    return {
      corsHeaders: this.mapUniqueKeyToStringArray(config.corsHeaders),
      extraLBAnnotations: this.mapKeyValueToMap(config.extraLBAnnotations),
      deploymentStrategy:
        this.deploymentStrategyToProto(config.deploymentStrategy) ?? ProtoDeploymentStrategy.ROLLING_UPDATE,
      healthCheckConfig: this.healthCheckToProto(config.healthCheckConfig),
      proxyBuffering: config.proxyBuffering,
      proxyHeaders: this.mapUniqueKeyToStringArray(config.proxyHeaders),
      useLoadBalancer: config.useLoadBalancer,
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
            port: config.metrics.port ?? null,
          }
        : null,
      replicaCount: config.replicas,
    }
  }

  instancesCreatedEventToMessage(event: InstancesCreatedEvent): InstancesAddedMessage {
    return event.instances.map(it => ({
      id: it.id,
      configId: it.configId,
      image: this.imageMapper.toDetailsDto(it.image),
    }))
  }

  instanceDeletedEventToMessage(event: InstanceDeletedEvent): InstanceDeletedMessage {
    return {
      instanceId: event.id,
      configId: event.configId,
    }
  }

  bundlesUpdatedEventToMessage(event: DeploymentConfigBundlesUpdatedEvent): DeploymentBundlesUpdatedMessage {
    return {
      bundles: event.bundles.map(it => this.configBundleMapper.toDto(it)),
    }
  }

  private mapInitContainerToAgent(list: InitContainer[]): AgentInitContainer[] {
    if (!list) {
      return []
    }

    const result: AgentInitContainer[] = []

    list.forEach(it => {
      result.push({
        ...it,
        environment: this.mapKeyValueToMap(it.environment),
        command: it.command?.map(cit => cit.key) ?? [],
        args: it.args?.map(ait => ait.key) ?? [],
      })
    })

    return result
  }

  private mapKeyValueToMap(list: UniqueKeyValue[]): { [key: string]: string } {
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

  private storageToImportContainer(config: ConcreteContainerConfigData, storage: Storage): ImportContainer {
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

  private healthCheckProbeToProto(it: HealthCheckProbe | null): ProtoProbe | null {
    if (!it) {
      return null
    }

    if (it.type === 'exec') {
      return {
        type: probeTypeFromJSON(it.type.toUpperCase()),
        port: 0,
        path: '',
        command: this.mapUniqueKeyToStringArray(it.command),
      }
    }

    return {
      type: probeTypeFromJSON(it.type.toUpperCase()),
      path: it.path,
      port: it.port,
      command: [],
    }
  }

  private healthCheckToProto(it: HealthCheck): ProtoHealthCheckConfig {
    if (!it) {
      return null
    }

    return {
      livenessProbe: this.healthCheckProbeToProto(it.liveness),
      readinessProbe: this.healthCheckProbeToProto(it.readiness),
      startupProbe: this.healthCheckProbeToProto(it.startup),
    }
  }

  private logDriverToProto(it: ContainerLogDriverType): ProtoDriverType {
    switch (it) {
      case undefined:
      case null:
      case 'none':
        return ProtoDriverType.DRIVER_TYPE_NONE
      case 'json-file':
        return ProtoDriverType.JSON_FILE
      default:
        return driverTypeFromJSON(it.toUpperCase())
    }
  }

  private volumesToProto(volumes: Volume[]): ProtoVolume[] {
    if (!volumes) {
      return []
    }

    return volumes.map(it => ({ ...it, type: this.volumeTypeToProto(it.type) }))
  }

  private volumeTypeToProto(it?: ContainerVolumeType): ProtoVolumeType {
    if (!it) {
      return ProtoVolumeType.RO
    }

    return volumeTypeFromJSON(it.toUpperCase())
  }

  private stateToProto(state: ContainerState): ProtoContainerState {
    if (!state) {
      return null
    }

    switch (state) {
      case 'running':
        return ProtoContainerState.RUNNING
      case 'waiting':
        return ProtoContainerState.WAITING
      case 'exited':
        return ProtoContainerState.EXITED
      default:
        return ProtoContainerState.CONTAINER_STATE_UNSPECIFIED
    }
  }

  private exposeStrategyToProto(type: ExposeStrategy): ProtoExposeStrategy {
    if (!type) {
      return ProtoExposeStrategy.NONE_ES
    }

    switch (type) {
      case ExposeStrategy.expose:
        return ProtoExposeStrategy.EXPOSE
      case ExposeStrategy.exposeWithTls:
        return ProtoExposeStrategy.EXPOSE_WITH_TLS
      default:
        return ProtoExposeStrategy.NONE_ES
    }
  }

  private restartPolicyToProto(type: RestartPolicy): ProtoRestartPolicy {
    if (!type) {
      return null
    }

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

  private deploymentStrategyToProto(type: DeploymentStrategy): ProtoDeploymentStrategy {
    if (!type) {
      return null
    }

    switch (type) {
      case DeploymentStrategy.recreate:
        return ProtoDeploymentStrategy.RECREATE
      case DeploymentStrategy.rolling:
        return ProtoDeploymentStrategy.ROLLING_UPDATE
      default:
        return ProtoDeploymentStrategy.DEPLOYMENT_STRATEGY_UNSPECIFIED
    }
  }

  private networkModeToProto(it: NetworkMode): ProtoNetworkMode {
    if (!it) {
      return null
    }

    return networkModeFromJSON(it?.toUpperCase())
  }
}

type DbDeployableDeployment = Deployment & {
  version: {
    name: string
    type: VersionTypeEnum
  }
  nodeId: string
  config: ContainerConfig
  configBundles: {
    configBundle: {
      config: ContainerConfig
    }
  }[]
  instances: {
    id: string
    image: ImageDetails
    configId: string
    config: ContainerConfig
  }[]
}
