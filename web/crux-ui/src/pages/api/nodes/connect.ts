import { invalidArgument } from '@app/error-responses'
import { Logger } from '@app/logger'
import { activeTeamOf, UserMeta } from '@app/models'
import { API_USERS_ME } from '@app/routes'
import { postCrux } from '@app/utils'
import { redirectedWebSocketEndpoint } from '@server/websocket-endpoint'
import { NextApiRequest } from 'next'

const logger = new Logger('ws-nodes-redirect')

const onRedirect = async (req: NextApiRequest): Promise<string> => {
  const route = req.url

  const user = await postCrux<null, UserMeta>(req, API_USERS_ME, null)
  const activeTeam = activeTeamOf(user)
  if (!activeTeam) {
    throw invalidArgument('activeTeam', 'User does not have and active team')
  }

  return `${route}/${activeTeam.id}`
}

export default redirectedWebSocketEndpoint(logger, onRedirect)
