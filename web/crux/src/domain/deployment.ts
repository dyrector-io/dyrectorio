import { ContainerStateEnum, DeploymentEventTypeEnum, DeploymentStatusEnum, VersionTypeEnum } from '.prisma/client'
import { Logger } from '@nestjs/common'
import { Observable, Subject } from 'rxjs'
import { AgentCommand, VersionDeployRequest } from 'src/grpc/protobuf/proto/agent'
import {
  ContainerState,
  DeploymentStatusMessage,
  DeploymentStatus as ProtoDeploymentStatus,
  containerStateToJSON,
  deploymentStatusToJSON,
} from 'src/grpc/protobuf/proto/common'
import { MergedContainerConfigData } from './container'

export type DeploymentProgressContainerEvent = {
  instanceId: string
  state: ContainerStateEnum
}

export type DeploymentProgressEvent = {
  type: DeploymentEventTypeEnum
  value: string[] | DeploymentStatusEnum | DeploymentProgressContainerEvent
}

export const deploymentStatusToDb = (status: ProtoDeploymentStatus): DeploymentStatusEnum => {
  switch (status) {
    case ProtoDeploymentStatus.IN_PROGRESS:
      return DeploymentStatusEnum.inProgress
    default:
      return deploymentStatusToJSON(status).toLowerCase() as DeploymentStatusEnum
  }
}

export const containerStateToDb = (state: ContainerState): ContainerStateEnum => {
  if (!state || state === ContainerState.UNRECOGNIZED) {
    return null
  }

  return containerStateToJSON(state).toLowerCase() as ContainerStateEnum
}

export const containerNameFromImageName = (imageName: string): string => {
  const index = imageName.lastIndexOf('/')
  if (index < 0 || index + 1 >= imageName.length) {
    return imageName
  }

  return imageName.substring(index + 1)
}

export const checkDeploymentCopiability = (status: DeploymentStatusEnum, type: VersionTypeEnum): boolean =>
  type !== 'rolling' && status !== 'inProgress' && status !== 'preparing'

export const checkDeploymentDeletability = (status: DeploymentStatusEnum): boolean => status !== 'inProgress'

export const checkDeploymentMutability = (status: DeploymentStatusEnum, type: VersionTypeEnum): boolean => {
  switch (status) {
    case 'preparing':
      return true
    case 'successful':
    case 'failed':
      return type === 'rolling'
    default:
      return false
  }
}

export const checkDeploymentDeployability = (status: DeploymentStatusEnum, type: VersionTypeEnum): boolean => {
  switch (status) {
    case 'preparing':
    case 'obsolete':
      return true
    case 'successful':
    case 'failed':
      return type === 'rolling'
    default:
      return false
  }
}

export type DeploymentNotification = {
  accessedBy: string
  productName: string
  versionName: string
  nodeName: string
}

export default class Deployment {
  private statusChannel = new Subject<DeploymentStatusMessage>()

  private status: DeploymentStatusEnum = 'preparing'

  readonly id: string

  constructor(
    private readonly request: VersionDeployRequest,
    public notification: DeploymentNotification,
    public mergedConfigs: Map<string, MergedContainerConfigData>,
    public readonly tries: number,
  ) {
    this.id = request.id
  }

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
      deploy: this.request,
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
        type: DeploymentEventTypeEnum.containerStatus,
        value: {
          instanceId: progress.instance.instanceId,
          state: containerStateToDb(progress.instance.state),
        },
      })
    }

    const length = progress.log?.length ?? 0

    if (length > 0) {
      events.push({
        type: DeploymentEventTypeEnum.log,
        value: progress.log,
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
    logger.debug(`> ${this.id}, open: ${!this.statusChannel.closed}`)
  }
}
