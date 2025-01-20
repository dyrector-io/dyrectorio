import {
  ConfigBundle,
  ContainerConfig,
  Deployment as DbDeployment,
  DeploymentEventTypeEnum,
  DeploymentStatusEnum,
  DeploymentToken,
  Instance,
  Node,
  Project,
  Version,
  VersionTypeEnum,
} from '.prisma/client'
import { Logger } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { Observable, Subject } from 'rxjs'
import { AgentCommand, DeployRequest } from 'src/grpc/protobuf/proto/agent'
import {
  DeploymentMessageLevel,
  DeploymentStatusMessage,
  ContainerState as ProtoContainerState,
  DeploymentStatus as ProtoDeploymentStatus,
  containerStateToJSON,
  deploymentStatusToJSON,
} from 'src/grpc/protobuf/proto/common'
import { BasicProperties } from 'src/shared/dtos/shared.dto'
import { ConcreteContainerConfigData, ContainerState } from './container'
import { ImageDetails } from './image'

export type DeploymentWithNode = DbDeployment & {
  node: Pick<Node, BasicProperties>
}

export type DeploymentWithNodeVersion = DeploymentWithNode & {
  version: Pick<Version, BasicProperties> & {
    project: Pick<Project, BasicProperties>
  }
}

export type InstanceDetails = Instance & {
  image: ImageDetails
  config: ContainerConfig
}

type ConfigBundleDetails = ConfigBundle & {
  config: ContainerConfig
}

export type DeploymentWithConfig = DbDeployment & {
  config: ContainerConfig
}

export type DeploymentWithConfigAndBundles = DeploymentWithNodeVersion & {
  config: ContainerConfig
  configBundles: {
    configBundle: ConfigBundleDetails
  }[]
}

export type DeploymentDetails = DeploymentWithConfigAndBundles & {
  token: Pick<DeploymentToken, 'id' | 'name' | 'createdAt' | 'expiresAt'>
  instances: InstanceDetails[]
}

export type DeploymentLogLevel = 'info' | 'warn' | 'error'

export type DeploymentLogEvent = {
  log: string[]
  level: DeploymentLogLevel
}

export type DeploymentProgressContainerEvent = {
  instanceId: string
  state: ContainerState
  reason: string
}

export type DeploymentProgressEvent = {
  type: DeploymentEventTypeEnum
  value: DeploymentLogEvent | DeploymentStatusEnum | DeploymentProgressContainerEvent
}

export const deploymentStatusToDb = (status: ProtoDeploymentStatus): DeploymentStatusEnum => {
  switch (status) {
    case ProtoDeploymentStatus.IN_PROGRESS:
      return DeploymentStatusEnum.inProgress
    default:
      return deploymentStatusToJSON(status).toLowerCase() as DeploymentStatusEnum
  }
}

export const deploymentLogLevelToDb = (level: DeploymentMessageLevel): DeploymentLogLevel => {
  switch (level) {
    case DeploymentMessageLevel.INFO:
      return 'info'
    case DeploymentMessageLevel.WARNING:
      return 'warn'
    case DeploymentMessageLevel.ERROR:
      return 'error'
    default:
      return 'info'
  }
}

export const containerStateToDto = (state: ProtoContainerState): ContainerState => {
  if (!state || state === ProtoContainerState.UNRECOGNIZED) {
    return null
  }

  return containerStateToJSON(state).toLowerCase() as ContainerState
}

export const containerNameFromImageName = (imageName: string): string => {
  const index = imageName.lastIndexOf('/')
  if (index < 0 || index + 1 >= imageName.length) {
    return imageName
  }

  return imageName.substring(index + 1)
}

export const checkDeploymentCopiability = (status: DeploymentStatusEnum): boolean => status !== 'inProgress'

/**
 *
 * @param versionType
 * @param deployments the deployments with the copy target's nodeId and prefix in the same version
 */
export const checkPrefixAvailability = (
  version: {
    type: VersionTypeEnum
    deployments: Pick<DbDeployment, 'status' | 'nodeId' | 'prefix'>[]
  },
  nodeId: string,
  prefix: string,
): boolean => {
  const relevantDeployments = version.deployments.filter(it => it.nodeId === nodeId && it.prefix === prefix)

  if (version.type === 'rolling') {
    return relevantDeployments.length < 1
  }

  return !relevantDeployments.find(it => it.status === 'preparing' || it.status === 'inProgress')
}

export const deploymentIsDeletable = (status: DeploymentStatusEnum): boolean => status !== 'inProgress'

export const deploymentIsMutable = (status: DeploymentStatusEnum, type: VersionTypeEnum): boolean => {
  switch (status) {
    case 'preparing':
    case 'failed':
      return true
    case 'successful':
      return type === 'rolling'
    default:
      return false
  }
}

export const checkDeploymentDeployability = (status: DeploymentStatusEnum, type: VersionTypeEnum): boolean => {
  switch (status) {
    case 'preparing':
    case 'failed':
    case 'obsolete':
      return true
    case 'successful':
      return type === 'rolling'
    default:
      return false
  }
}

export type DeploymentNotification = {
  teamId: string
  actor: Identity | string
  projectName: string
  versionName: string
  nodeName: string
}

export type DeploymentOptions = {
  request: DeployRequest
  notification: DeploymentNotification
  instanceConfigs: Map<string, ConcreteContainerConfigData>
  deploymentConfig: ConcreteContainerConfigData
  tries: number
}

export default class Deployment {
  private statusChannel = new Subject<DeploymentStatusMessage>()

  private status: DeploymentStatusEnum = 'preparing'

  get id(): string {
    return this.options.request.id
  }

  get notification(): DeploymentNotification {
    return this.options.notification
  }

  get instanceConfigs(): Map<string, ConcreteContainerConfigData> {
    return this.options.instanceConfigs
  }

  get deploymentConfig(): ConcreteContainerConfigData {
    return this.options.deploymentConfig
  }

  get tries(): number {
    return this.options.tries
  }

  constructor(private readonly options: DeploymentOptions) {}

  getStatus() {
    return this.status
  }

  start(commandChannel: Subject<AgentCommand>): Observable<DeploymentStatusMessage> {
    this.status = 'inProgress'
    this.statusChannel.next({
      log: [],
      deploymentStatus: ProtoDeploymentStatus.IN_PROGRESS,
      instance: null,
    })

    commandChannel.next({
      deploy: this.options.request,
    } as AgentCommand)

    return this.statusChannel.asObservable()
  }

  onUpdate(progress: DeploymentStatusMessage): DeploymentProgressEvent[] {
    const events: DeploymentProgressEvent[] = []

    if (progress.deploymentStatus) {
      this.status = deploymentStatusToDb(progress.deploymentStatus)
      events.push({
        type: DeploymentEventTypeEnum.deploymentStatus,
        value: this.status,
      })
    }

    if (progress.instance) {
      events.push({
        type: DeploymentEventTypeEnum.containerState,
        value: {
          instanceId: progress.instance.instanceId,
          state: containerStateToDto(progress.instance.state),
          reason: progress.instance.reason,
        },
      })
    }

    const length = progress.log?.length ?? 0

    if (length > 0) {
      events.push({
        type: DeploymentEventTypeEnum.log,
        value: {
          log: progress.log,
          level: deploymentLogLevelToDb(progress.logLevel),
        },
      })
    }

    this.statusChannel.next(progress)

    return events
  }

  onDisconnected() {
    this.statusChannel.complete()
  }

  watchStatus(): Observable<DeploymentStatusMessage> {
    return this.statusChannel.asObservable()
  }

  debugInfo(logger: Logger): void {
    logger.verbose(`> ${this.id}, open: ${!this.statusChannel.closed}`)
  }
}
