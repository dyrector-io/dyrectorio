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

export type Node = NodeConnection & {
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

export type NodeDetails = Node & {
  hasToken: boolean
  install?: NodeInstall
}

export const nodeConnectionOf = (node: Node): NodeConnection => ({
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
  updating?: boolean
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
  container: ContainerIdentifier
}

export const WS_TYPE_UPDATE_NODE_AGENT = 'update-node-agent'
export type UpdateNodeAgentMessage = {
  id: string
}

export const WS_TYPE_CONTAINER_COMMAND = 'container-command'
export type ContainerCommandMessage = ContainerCommand

export const WS_TYPE_WATCH_CONTAINER_LOG = 'container-log-watch'
export const WS_TYPE_STOP_WATCHING_CONTAINER_LOG = 'stop-container-log-watch'
export type WatchContainerLogMessage = {
  container: ContainerIdentifier
}

export const WS_TYPE_CONTAINER_LOG = 'container-log'
export type ContainerLogMessage = {
  log: string
}
