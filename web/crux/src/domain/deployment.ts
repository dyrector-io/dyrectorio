import {
  ContainerStateEnum,
  Deployment as DbDeployment,
  DeploymentEventTypeEnum,
  DeploymentStatusEnum,
} from '.prisma/client'
import { Logger, PreconditionFailedException } from '@nestjs/common'
import { Observable, Subject } from 'rxjs'
import { AgentCommand, VersionDeployRequest } from 'src/grpc/protobuf/proto/agent'
import {
  ContainerState,
  containerStateToJSON,
  DeploymentProgressMessage,
  DeploymentStatus,
  DeploymentStatusMessage,
  deploymentStatusToJSON,
} from 'src/grpc/protobuf/proto/crux'

export class Deployment {
  private statusChannel = new Subject<DeploymentProgressMessage>()
  private _status = DeploymentStatus.PREPARING

  readonly id: string

  constructor(private readonly request: VersionDeployRequest, public notification: DeploymentNotification) {
    this.id = request.id
  }

  status() {
    return this._status
  }

  start(commandChannel: Subject<AgentCommand>): Observable<DeploymentProgressMessage> {
    this._status = DeploymentStatus.IN_PROGRESS
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

    if (progress.deploymentStatus && this._status !== progress.deploymentStatus) {
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

    if (progress.log?.length ?? 0 > 0) {
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

  debugInfo(logger: Logger): void {
    logger.debug(`> ${this.id}, open: ${!this.statusChannel.closed}`)
  }
}

export type DeploymentProgressContainerEvent = {
  instanceId: string
  state: ContainerStateEnum
}

export type DeploymentProgressEvent = {
  type: DeploymentEventTypeEnum
  value: string[] | DeploymentStatusEnum | DeploymentProgressContainerEvent
}

export const defaultDeploymentName = (product: string, version: string, node: string): string =>
  `${product}-${version}-${node}`

export const previousDeployPrefix = (
  deployments: DbDeployment[],
  versionId: string,
  parentVersionId?: string,
): string => {
  if (deployments.length < 1) {
    return null
  }

  const prevDeployment = deployments.reduce((prev, it) => {
    if (!prev) {
      return it
    }

    if (prev.versionId === parentVersionId && it.versionId === versionId) {
      // the same version is more relevant, the parent is just a fallback
      return it
    }

    return prev.updatedAt < it.updatedAt ? it : prev
  })

  return prevDeployment?.prefix
}

export const deploymentPrefixFromName = (name: string) => name.toLowerCase().replace(/\s/g, '')

export const deploymentStatusToDb = (status: DeploymentStatus): DeploymentStatusEnum => {
  switch (status) {
    case DeploymentStatus.IN_PROGRESS:
      return DeploymentStatusEnum.inProgress
    default:
      return deploymentStatusToJSON(status).toLowerCase() as DeploymentStatusEnum
  }
}

export const containerStateToDb = (state: ContainerState): ContainerStateEnum => {
  return containerStateToJSON(state).toLowerCase() as ContainerStateEnum
}

export const containerNameFromImageName = (imageName: string): string => {
  const index = imageName.lastIndexOf('/')
  if (index < 0 || index + 1 >= imageName.length) {
    return imageName
  }

  return imageName.substring(index + 1)
}

export type DeploymentMutabilityCheckDao = {
  status: DeploymentStatusEnum
}

export const checkDeploymentMutability = (deployment: DeploymentMutabilityCheckDao) => {
  if (!MUTABLE_DEPLOYMENT_STATUSES.includes(deployment.status)) {
    throw new PreconditionFailedException({
      message: 'Invalid deployment status.',
      property: 'status',
      value: deployment.status,
    })
  }
}

export const MUTABLE_DEPLOYMENT_STATUSES = [
  DeploymentStatusEnum.preparing,
  DeploymentStatusEnum.failed,
] as DeploymentStatusEnum[]

export type DeploymentNotification = {
  deploymentName: string
  accessedBy: string
}
