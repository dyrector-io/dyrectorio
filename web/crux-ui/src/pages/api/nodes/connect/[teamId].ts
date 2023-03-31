import { Logger } from '@app/logger'
import {
  activeTeamOf,
  GetNodeStatusListMessage,
  Node,
  NodeStatusMessage,
  UpdateNodeAgentMessage,
  UserMeta,
  WS_TYPE_GET_NODE_STATUS_LIST,
  WS_TYPE_NODE_STATUS,
  WS_TYPE_NODE_STATUSES,
  WS_TYPE_UPDATE_NODE_AGENT,
} from '@app/models'
import { API_NODES, API_USERS_ME, nodeUpdateApiUrl } from '@app/routes'
import { WsMessage } from '@app/websockets/common'
import WsConnection from '@app/websockets/connection'
import WsEndpoint from '@app/websockets/endpoint'
import { getCrux, postCrux } from '@server/crux-api'
import { Crux } from '@server/crux/crux'
import { routedWebSocketEndpoint } from '@server/websocket-endpoint'
import { NextApiRequest } from 'next'

const logger = new Logger('ws-nodes')

const onReady = async (endpoint: WsEndpoint) => {
  const teamId = endpoint.query.teamId as string
  await Crux.withIdentity(null, null).nodes.subscribeToNodeEvents(teamId, {
    onClose: () => logger.debug(`Crux disconnected for: ${teamId}`),
    onMessage: message => endpoint.sendAll(WS_TYPE_NODE_STATUS, message),
  })
}

const onAuthorize = async (endpoint: WsEndpoint, req: NextApiRequest): Promise<boolean> => {
  const teamId = endpoint.query.teamId as string

  try {
    const user = await postCrux<null, UserMeta>(req, API_USERS_ME, null)
    const activeTeam = activeTeamOf(user)

    return teamId === activeTeam?.id
  } catch {
    return false
  }
}

const onGetNodeStatuses = async (
  _: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<GetNodeStatusListMessage>,
) => {
  const req = message.payload

  const nodes = await getCrux<Node[]>(connection.request, API_NODES)

  const res = nodes
    .filter(it => req.nodeIds.includes(it.id))
    .map(
      it =>
        ({
          nodeId: it.id,
          status: it.status,
          address: it.address,
        } as NodeStatusMessage),
    )

  connection.send(WS_TYPE_NODE_STATUSES, res as NodeStatusMessage[])
}

const onUpdateNodeAgent = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<UpdateNodeAgentMessage>,
) => {
  await postCrux(connection.request, nodeUpdateApiUrl(message.payload.id), message.payload)
}

export default routedWebSocketEndpoint(
  logger,
  [
    [WS_TYPE_GET_NODE_STATUS_LIST, onGetNodeStatuses],
    [WS_TYPE_UPDATE_NODE_AGENT, onUpdateNodeAgent],
  ],
  [],
  {
    onReady,
    onAuthorize,
  },
)
