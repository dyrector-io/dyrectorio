import { XOR } from './common'
import { Container, ContainerCommand, ContainerIdentifier } from './container'

export const NODE_TYPE_VALUES = ['docker', 'k8s'] as const
export type NodeType = typeof NODE_TYPE_VALUES[number]

export type NodeStatus = 'connecting' | 'unreachable' | 'running'

export type NodeConnection = {
  address?: string
  status: NodeStatus
  connectedAt?: string
  version?: string
}

export type DyoNode = NodeConnection & {
  id: string
  icon?: string
  name: string
  description?: string
  type: NodeType
}

export const nodeConnectionOf = (node: DyoNode | DyoNodeDetails): NodeConnection => ({
  address: node.address,
  status: node.status,
  connectedAt: node.connectedAt,
  version: node.version,
})

export type DyoNodeInstall = {
  command: string
  expireAt: string
  script: string
}

export type DyoNodeDetails = DyoNode & {
  hasToken: boolean
  install?: DyoNodeInstall
}

export type CreateDyoNode = {
  icon?: string
  name: string
  description?: string
}

export type UpdateDyoNode = CreateDyoNode & {
  address: string
}

export type DyoNodeScript = {
  content: string
}

type DeleteContainersByPrefix = {
  prefix: string
}

type DeleteContainerById = {
  id: string | ContainerIdentifier
}

export type DeleteContainers = XOR<DeleteContainersByPrefix, DeleteContainerById>

// ws

export const WS_TYPE_GET_NODE_STATUS_LIST = 'get-node-status-list'
export type GetNodeStatusListMessage = {
  nodeIds: string[]
}

export const WS_TYPE_NODE_STATUS = 'node-status'
export type NodeStatusMessage = {
  nodeId: string
  status: NodeStatus
  address?: string
  version?: string
  connectedAt?: string
  error?: string
}

export const WS_TYPE_NODE_STATUSES = 'node-status-list'

export const WS_TYPE_WATCH_CONTAINER_STATUS = 'watch-container-status'
export const WS_TYPE_STOP_WATCHING_CONTAINER_STATUS = 'stop-watching-container-status'
export type WatchContainerStatusMessage = {
  prefix?: string
}

export const WS_TYPE_CONTAINER_STATUS_LIST = 'container-status-list'
export type ContainerListMessage = Container[]

export const WS_TYPE_DELETE_CONTAINER = 'delete-containers'
export type DeleteContainerMessage = {
  id: string | ContainerIdentifier
}

export const WS_TYPE_UPDATE_NODE_AGENT = 'update-node-agent'
export type UpdateNodeAgentMessage = {
  id: string
}

export const WS_TYPE_CONTAINER_COMMAND = 'container-command'
export type ContainerCommandMessage = ContainerCommand
