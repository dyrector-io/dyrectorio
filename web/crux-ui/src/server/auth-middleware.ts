import { unauthorizedError } from '@app/error-responses'
import { NextApiRequest, NextApiResponse } from 'next'
import { IncomingMessageWithSession, obtainSessionFromRequest } from './kratos'

const useAuthorizeApiMiddleware = async (req: NextApiRequest, res: NextApiResponse, next: () => Promise<void>) => {
  const session = await obtainSessionFromRequest(req)
  if (!session) {
    throw unauthorizedError('Cookie is missing')
  }

  const { cookie } = req.headers

  const cruxRequest = req as IncomingMessageWithSession
  cruxRequest.session = session
  cruxRequest.cookie = cookie

  await next()
}

export default useAuthorizeApiMiddleware
