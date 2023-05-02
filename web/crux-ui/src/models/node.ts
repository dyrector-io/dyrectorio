import { Container, ContainerCommand, ContainerIdentifier } from './container'

export const NODE_TYPE_VALUES = ['docker', 'k8s'] as const
export type NodeType = typeof NODE_TYPE_VALUES[number]

export const NODE_INSTALL_SCRIPT_TYPE_VALUES = ['shell', 'powershell'] as const
export type NodeInstallScriptType = typeof NODE_INSTALL_SCRIPT_TYPE_VALUES[number]

export type NodeStatus = 'unreachable' | 'connected'

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
  traefik?: NodeInstallTraefik
}

export type NodeDeleteContainer = {
  container?: ContainerIdentifier
  prefix?: string
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
