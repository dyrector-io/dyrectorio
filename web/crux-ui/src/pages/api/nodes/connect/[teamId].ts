import { Logger } from '@app/logger'
import {
  GetNodeStatusListMessage,
  NodeStatusMessage,
  WS_TYPE_GET_NODE_STATUS_LIST,
  WS_TYPE_NODE_STATUS,
  WS_TYPE_NODE_STATUSES,
} from '@app/models'
import { WsMessage } from '@app/websockets/common'
import { WsConnection, WsEndpoint } from '@app/websockets/server'
import crux, { Crux, cruxFromConnection } from '@server/crux/crux'
import { routedWebSocketEndpoint } from '@server/websocket-endpoint'
import { NextApiRequest } from 'next'

const logger = new Logger('ws-nodes')

const onReady = async (endpoint: WsEndpoint) => {
  const teamId = endpoint.query.teamId as string

  await Crux.withIdentity(null).nodes.subscribeToNodeEvents(teamId, {
    onClose: () => logger.debug(`Crux disconnected for: ${teamId}`),
    onMessage: message => endpoint.sendAll(WS_TYPE_NODE_STATUS, message),
  })
}

const onAuthorize = async (endpoint: WsEndpoint, req: NextApiRequest): Promise<boolean> => {
  const teamId = endpoint.query.teamId as string

  try {
    const team = await crux(req).teams.getActiveTeam()
    return teamId === team.id
  } catch {
    return false
  }
}

const onGetNodeStatuses = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<GetNodeStatusListMessage>,
) => {
  const req = message.payload

  const nodes = await cruxFromConnection(connection).nodes.getAll()
  const res = nodes
    .filter(it => req.nodeIds.includes(it.id))
    .map(it => {
      return {
        nodeId: it.id,
        status: it.status,
        address: it.address,
      } as NodeStatusMessage
    })

  connection.send(WS_TYPE_NODE_STATUSES, res as NodeStatusMessage[])
}

export default routedWebSocketEndpoint(logger, [[WS_TYPE_GET_NODE_STATUS_LIST, onGetNodeStatuses]], [], {
  onReady,
  onAuthorize,
})
