import { Logger } from '@nestjs/common'
import { Observable, Subject } from 'rxjs'
import { AgentCommand, VersionDeployRequest } from 'src/grpc/protobuf/proto/agent'
import { DeploymentProgressMessage } from 'src/grpc/protobuf/proto/crux'
import {
  ContainerState,
  containerStateToJSON,
  DeploymentStatus,
  DeploymentStatusMessage,
  deploymentStatusToJSON,
} from 'src/grpc/protobuf/proto/common'
import { ContainerStateEnum, DeploymentEventTypeEnum, DeploymentStatusEnum, VersionTypeEnum } from '.prisma/client'
import { MergedContainerConfigData } from 'src/shared/models'

export type DeploymentProgressContainerEvent = {
  instanceId: string
  state: ContainerStateEnum
}

export type DeploymentProgressEvent = {
  type: DeploymentEventTypeEnum
  value: string[] | DeploymentStatusEnum | DeploymentProgressContainerEvent
}

export const deploymentStatusToDb = (status: DeploymentStatus): DeploymentStatusEnum => {
  switch (status) {
    case DeploymentStatus.IN_PROGRESS:
      return DeploymentStatusEnum.inProgress
    default:
      return deploymentStatusToJSON(status).toLowerCase() as DeploymentStatusEnum
  }
}

export const containerStateToDb = (state: ContainerState): ContainerStateEnum =>
  containerStateToJSON(state).toLowerCase() as ContainerStateEnum

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
      return type === 'rolling'
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
      return type === 'rolling'
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
  private statusChannel = new Subject<DeploymentProgressMessage>()

  private status = DeploymentStatus.PREPARING

  readonly id: string

  constructor(
    private readonly request: VersionDeployRequest,
    public notification: DeploymentNotification,
    public mergedConfigs: Map<string, MergedContainerConfigData>,
  ) {
    this.id = request.id
  }

  getStatus() {
    return this.status
  }

  start(commandChannel: Subject<AgentCommand>): Observable<DeploymentProgressMessage> {
    this.status = DeploymentStatus.IN_PROGRESS
    this.statusChannel.next({
      id: this.id,
      log: [],
      status: DeploymentStatus.IN_PROGRESS,
    })

    commandChannel.next({
      deploy: this.request,
    } as AgentCommand)

    return this.statusChannel.asObservable()
  }

  onUpdate(progress: DeploymentStatusMessage): DeploymentProgressEvent[] {
    const events: DeploymentProgressEvent[] = []

    if (progress.deploymentStatus) {
      this.status = progress.deploymentStatus
      events.push({
        type: DeploymentEventTypeEnum.deploymentStatus,
        value: deploymentStatusToDb(progress.deploymentStatus),
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

    this.statusChannel.next({
      id: this.id,
      log: progress.log,
      instance: progress.instance,
      status: progress.deploymentStatus,
    })

    return events
  }

  onDisconnected() {
    this.statusChannel.complete()
  }

  watchStatus(): Observable<DeploymentProgressMessage> {
    return this.statusChannel.asObservable()
  }

  debugInfo(logger: Logger): void {
    logger.debug(`> ${this.id}, open: ${!this.statusChannel.closed}`)
  }
}
