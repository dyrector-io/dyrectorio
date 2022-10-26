import { Logger } from '@app/logger'
import {
  UpdateNodeAgentMessage,
  WatchContainerStatusMessage,
  WS_TYPE_STOP_WATCHING_CONTAINER_STATUS,
  WS_TYPE_UPDATE_NODE_AGENT,
  WS_TYPE_WATCH_CONTAINER_STATUS,
} from '@app/models'
import { WsMessage } from '@app/websockets/common'
import WsConnection from '@app/websockets/connection'
import WsEndpoint from '@app/websockets/endpoint'
import ContainerStatusWatcherService from '@server/container-status-watchers-service'
import crux, { cruxFromConnection } from '@server/crux/crux'
import { routedWebSocketEndpoint } from '@server/websocket-endpoint'
import useWebsocketErrorMiddleware from '@server/websocket-error-middleware'
import { NextApiRequest } from 'next'

const logger = new Logger('ws-nodes/nodeId')

const watcherServices: Map<string, ContainerStatusWatcherService> = new Map()

const onAuthorize = async (endpoint: WsEndpoint, req: NextApiRequest): Promise<boolean> => {
  const nodeId = endpoint.query.nodeId as string

  try {
    await crux(req).nodes.getNodeDetails(nodeId)
    return true
  } catch {
    return false
  }
}

const onConnect = (endpoint: WsEndpoint) => {
  const nodeId = endpoint.query.nodeId as string

  const watchers = watcherServices.get(nodeId)
  if (!watchers) {
    watcherServices.set(nodeId, new ContainerStatusWatcherService(nodeId))
  }
}

const onDisconnect = (endpoint: WsEndpoint, connection: WsConnection) => {
  const nodeId = endpoint.query.nodeId as string

  const watchers = watcherServices.get(nodeId)
  if (!watchers) {
    return
  }

  watchers.onWebSocketDisconnected(connection)
}

const onWatchContainerStatus = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<WatchContainerStatusMessage>,
) => {
  const nodeId = endpoint.query.nodeId as string
  const watchers = watcherServices.get(nodeId)

  watchers.startWatching(connection, message.payload.prefix ?? '', cruxFromConnection(connection).nodes)
}

const onStopWatchingContainerStatus = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<WatchContainerStatusMessage>,
) => {
  const nodeId = endpoint.query.nodeId as string
  const watchers = watcherServices.get(nodeId)

  watchers.stopWatching(connection, message.payload.prefix ?? '')
}

const onUpdateNodeAgent = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<UpdateNodeAgentMessage>,
) => {
  await cruxFromConnection(connection).nodes.updateNodeAgent(message.payload.id)
}

export default routedWebSocketEndpoint(
  logger,
  [
    [WS_TYPE_WATCH_CONTAINER_STATUS, onWatchContainerStatus],
    [WS_TYPE_STOP_WATCHING_CONTAINER_STATUS, onStopWatchingContainerStatus],
    [WS_TYPE_UPDATE_NODE_AGENT, onUpdateNodeAgent],
  ],
  [useWebsocketErrorMiddleware],
  {
    onAuthorize,
    onConnect,
    onDisconnect,
  },
)
