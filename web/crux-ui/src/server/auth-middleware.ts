import { NextApiRequest, NextApiResponse } from 'next'
import { unauthorizedError } from './error-middleware'
import { IncomingMessageWithSession, obtainKratosSession } from './kratos'

export const useAuthorizeApiMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>,
) => {
  const session = await obtainKratosSession(req)
  if (!session) {
    throw unauthorizedError('Cookie is missing')
  }

  const cruxRequest = req as IncomingMessageWithSession
  cruxRequest.session = session

  await next()
}
