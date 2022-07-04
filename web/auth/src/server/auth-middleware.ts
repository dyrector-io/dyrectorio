import { Identity } from '@ory/kratos-client'
import { NextApiRequest, NextApiResponse } from 'next'
import { forbiddenError, unauthorizedError } from './error-middleware'
import kratos from './kratos'
import { UserTraitsDto } from './models'

const ADMINS = [
  'levente.orban@dyrector.io',
  'bertalan.puskas@dyrector.io',
  'nandor.magyar@dyrector.io',
  'mate.vago@dyrector.io',
]

export const userIsAdmin = (identity: Identity) => {
  const traits = identity.traits as UserTraitsDto
  const email = traits.email
  return ADMINS.includes(email) // TODO: handle admin authorization better
}

export const useAuthorizeAdminMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>,
) => {
  let admin = false
  try {
    const cookie = req.headers.cookie
    const res = await kratos.toSession(undefined, cookie)
    admin = userIsAdmin(res.data.identity)
  } catch {
    throw unauthorizedError()
  }

  if (admin) {
    await next()
  } else {
    throw forbiddenError()
  }
}
