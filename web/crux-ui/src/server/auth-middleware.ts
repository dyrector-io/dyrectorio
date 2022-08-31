import { unauthorizedError } from '@app/models'
import { NextApiRequest, NextApiResponse } from 'next'
import { IncomingMessageWithSession, obtainKratosSession } from './kratos'

const useAuthorizeApiMiddleware = async (req: NextApiRequest, res: NextApiResponse, next: () => Promise<void>) => {
  const session = await obtainKratosSession(req)
  if (!session) {
    throw unauthorizedError('Cookie is missing')
  }

  const cruxRequest = req as IncomingMessageWithSession
  cruxRequest.session = session

  await next()
}

export default useAuthorizeApiMiddleware
