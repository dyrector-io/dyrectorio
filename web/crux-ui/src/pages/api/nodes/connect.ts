import { Logger } from '@app/logger'
import crux from '@server/crux/crux'
import { redirectedWebSocketEndpoint } from '@server/websocket-endpoint'
import { NextApiRequest } from 'next'

const logger = new Logger('ws-nodes-redirect')

const onRedirect = async (request: NextApiRequest): Promise<string> => {
  const route = request.url

  const team = await crux(request).teams.getActiveTeam()
  return `${route}/${team.id}`
}

export default redirectedWebSocketEndpoint(logger, onRedirect)
