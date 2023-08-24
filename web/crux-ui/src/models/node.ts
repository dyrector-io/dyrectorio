import { PaginationQuery } from './common'
import { Container, ContainerCommand, ContainerIdentifier } from './container'

export const NODE_TYPE_VALUES = ['docker', 'k8s'] as const
export type NodeType = (typeof NODE_TYPE_VALUES)[number]

export const NODE_INSTALL_SCRIPT_TYPE_VALUES = ['shell', 'powershell'] as const
export type NodeInstallScriptType = (typeof NODE_INSTALL_SCRIPT_TYPE_VALUES)[number]

export const NODE_STATUS_VALUES = ['unreachable', 'connected', 'outdated'] as const
export type NodeStatus = (typeof NODE_STATUS_VALUES)[number]

export const NODE_EVENT_TYPE_VALUES = ['connected', 'kicked', 'left', 'update', 'containerCommand'] as const
export type NodeEventType = (typeof NODE_EVENT_TYPE_VALUES)[number]

export type NodeConnection = {
  address?: string
  status: NodeStatus
  connectedAt?: string
  version?: string
}

export type DyoNode = NodeConnection & {
  id: string
  name: string
  description?: string
  icon?: string
  type: NodeType
  updating: boolean
}

export type NodeInstall = {
  command: string
  script: string
  expireAt: string
}

export type NodeDetails = DyoNode & {
  hasToken: boolean
  install?: NodeInstall
  lastConnectionAt?: string
  inUse: boolean
}

export const nodeConnectionOf = (node: DyoNode): NodeConnection => ({
  address: node.address,
  status: node.status,
  connectedAt: node.connectedAt,
  version: node.version,
})

export type CreateNode = {
  name: string
  description?: string
  icon?: string
}

export type UpdateNode = CreateNode

export type NodeInstallTraefik = {
  acmeEmail: string
}

export type NodeGenerateScript = {
  type: NodeType
  rootPath?: string
  scriptType: NodeInstallScriptType
  dagentTraefik?: NodeInstallTraefik
}

export type NodeDeleteContainer = {
  container?: ContainerIdentifier
  prefix?: string
}

export type NodeAuditLogQuery = PaginationQuery & {
  filterEventType?: NodeEventType
}

export type NodeAuditLog = {
  createdAt: string
  event: string
  data?: object
}

export type NodeAuditLogList = {
  items: NodeAuditLog[]
  total: number
}

// ws

export const WS_TYPE_NODE_EVENT = 'event'
export type NodeEventMessage = {
  id: string
  status: NodeStatus
  address?: string
  version?: string
  connectedAt?: string
  error?: string
  updating?: boolean
}

export const WS_TYPE_WATCH_CONTAINERS_STATE = 'watch-containers-state'
export type WatchContainerStatusMessage = {
  prefix?: string
}

export const WS_TYPE_CONTAINERS_STATE_LIST = 'containers-state-list'
export type ContainersStateListMessage = {
  prefix: string
  containers: Container[]
}

export const WS_TYPE_WATCH_CONTAINER_LOG = 'watch-container-log'
export type WatchContainerLogMessage = {
  container: ContainerIdentifier
}

export const WS_TYPE_CONTAINER_LOG = 'container-log'
export type ContainerLogMessage = {
  log: string
}

export const WS_TYPE_DELETE_CONTAINER = 'delete-container'
export type DeleteContainerMessage = {
  container: ContainerIdentifier
}

export const WS_TYPE_UPDATE_AGENT = 'update-agent'
export type UpdateNodeAgentMessage = {
  id: string
}

export const WS_TYPE_CONTAINER_COMMAND = 'container-command'
export type ContainerCommandMessage = ContainerCommand

export const nodeIsUpdateable = (node: NodeDetails) =>
  (node.status === 'connected' || node.status === 'outdated') && !node.updating
