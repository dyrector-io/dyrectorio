import { Logger } from '@app/logger'
import {
  ContainerCommandMessage,
  DeleteContainerMessage,
  WatchContainerLogMessage,
  WatchContainerStatusMessage,
  WS_TYPE_CONTAINER_COMMAND,
  WS_TYPE_DELETE_CONTAINER,
  WS_TYPE_STOP_WATCHING_CONTAINER_LOG,
  WS_TYPE_STOP_WATCHING_CONTAINER_STATUS,
  WS_TYPE_WATCH_CONTAINER_LOG,
  WS_TYPE_WATCH_CONTAINER_STATUS,
} from '@app/models'
import {
  nodeApiUrl,
  nodeGlobalContainerApiUrl,
  nodeGlobalContainerOperationApiUrl,
  nodePrefixContainerApiUrl,
  nodePrefixContainerOperationApiUrl,
} from '@app/routes'
import { WsMessage } from '@app/websockets/common'
import WsConnection from '@app/websockets/connection'
import WsEndpoint from '@app/websockets/endpoint'
import ContainerLogStreamService from '@server/container-log-stream-service'
import ContainerStatusWatcherService from '@server/container-status-watchers-service'
import { deleteCrux, getCrux, postCrux } from '@server/crux-api'
import { cruxFromConnection } from '@server/crux/crux'
import { routedWebSocketEndpoint } from '@server/websocket-endpoint'
import useWebsocketErrorMiddleware from '@server/websocket-error-middleware'
import { NextApiRequest } from 'next'

const logger = new Logger('ws-nodes/nodeId')

const onReady = async (endpoint: WsEndpoint) => {
  const nodeId = endpoint.query.nodeId as string
  endpoint.services.register(ContainerStatusWatcherService, () => new ContainerStatusWatcherService(nodeId))
  endpoint.services.register(ContainerLogStreamService, () => new ContainerLogStreamService(nodeId))
}

const onAuthorize = async (endpoint: WsEndpoint, req: NextApiRequest): Promise<boolean> => {
  const nodeId = endpoint.query.nodeId as string

  try {
    await getCrux(req, nodeApiUrl(nodeId))
    return true
  } catch {
    return false
  }
}

const onDisconnect = (endpoint: WsEndpoint, connection: WsConnection) => {
  const watchers = endpoint.services.get(ContainerStatusWatcherService)
  watchers.onWebSocketDisconnected(connection)

  const logs = endpoint.services.get(ContainerLogStreamService)
  logs.onWebSocketDisconnected(connection)
}

const onContainerCommand = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<ContainerCommandMessage>,
) => {
  const nodeId = endpoint.query.nodeId as string
  const req = message.payload

  await postCrux(
    connection.request,
    req.container.prefix
      ? nodePrefixContainerOperationApiUrl(nodeId, req.container, req.operation)
      : nodeGlobalContainerOperationApiUrl(nodeId, req.container.name, req.operation),
    null,
  )
}

const onDeleteContainer = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<DeleteContainerMessage>,
) => {
  const nodeId = endpoint.query.nodeId as string
  const req = message.payload

  await deleteCrux(
    connection.request,
    req.container.prefix
      ? nodePrefixContainerApiUrl(nodeId, req.container)
      : nodeGlobalContainerApiUrl(nodeId, req.container.name),
  )
}

const onWatchContainerStatus = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<WatchContainerStatusMessage>,
) => {
  const watchers = endpoint.services.get(ContainerStatusWatcherService)
  watchers.startWatching(connection, message.payload.prefix ?? '', cruxFromConnection(connection).nodes)
}

const onStopWatchingContainerStatus = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<WatchContainerStatusMessage>,
) => {
  const watchers = endpoint.services.get(ContainerStatusWatcherService)
  watchers.stopWatching(connection, message.payload.prefix ?? '')
}

const onWatchContainerLog = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<WatchContainerLogMessage>,
) => {
  const service = endpoint.services.get(ContainerLogStreamService)
  service.startWatching(connection, cruxFromConnection(connection).nodes, message.payload.container)
}

const onStopWatchingContainerLog = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<WatchContainerLogMessage>,
) => {
  const service = endpoint.services.get(ContainerLogStreamService)
  service.stopWatching(connection, message.payload.container)
}

export default routedWebSocketEndpoint(
  logger,
  [
    [WS_TYPE_WATCH_CONTAINER_STATUS, onWatchContainerStatus],
    [WS_TYPE_STOP_WATCHING_CONTAINER_STATUS, onStopWatchingContainerStatus],
    [WS_TYPE_CONTAINER_COMMAND, onContainerCommand],
    [WS_TYPE_DELETE_CONTAINER, onDeleteContainer],
    [WS_TYPE_WATCH_CONTAINER_LOG, onWatchContainerLog],
    [WS_TYPE_STOP_WATCHING_CONTAINER_LOG, onStopWatchingContainerLog],
  ],
  [useWebsocketErrorMiddleware],
  {
    onReady,
    onAuthorize,
    onDisconnect,
  },
)
