import { Type } from 'class-transformer'
import { IsDate } from 'class-validator'
import { ContainerState } from 'src/domain/container'
import { ContainerIdentifierDto, NodeConnectionStatus } from '../shared/shared.dto'

export const WS_TYPE_NODE_EVENT = 'event'
export class NodeEventMessage {
  id: string

  status: NodeConnectionStatus

  address?: string

  version?: string

  @IsDate()
  @Type(() => Date)
  connectedAt?: Date

  error?: string

  updating?: boolean
}

export class ContainerPortDto {
  internal: number

  external: number
}

export class ContainerMessage {
  id: ContainerIdentifierDto

  imageName: string

  imageTag: string

  @IsDate()
  @Type(() => Date)
  date: Date

  state: ContainerState

  ports: ContainerPortDto[]
}

export type UpdateNodeMessage = {
  id: string
}

export type ContainerOperation = 'start' | 'stop' | 'restart'

// containers state
export const WS_TYPE_WATCH_CONTAINERS_STATE = 'watch-container-state'
export type WatchContainersStateMessage = {
  prefix: string
}

export const WS_TYPE_CONTAINERS_STATE_LIST = 'containers-state-list'
export class ContainersStateListMessage {
  prefix: string

  containers: ContainerMessage[]
}

// container log
export type WatchContainerLogMessage = {
  container: ContainerIdentifierDto
}

export const WS_TYPE_CONTAINER_LOG = 'container-log'
export type ContainerLogMessage = {
  log: string
}

export type DeleteContainerMessage = {
  container: ContainerIdentifierDto
}

export class ContainerCommandMessage {
  container: ContainerIdentifierDto

  operation: ContainerOperation
}
