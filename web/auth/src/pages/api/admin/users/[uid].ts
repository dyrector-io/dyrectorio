import { NextApiRequest, NextApiResponse } from 'next'
import { useAuthorizeAdminMiddleware } from '@server/auth-middleware'
import {
  forbiddenError,
  useErrorMiddleware,
} from '@server/error-middleware'
import kratos from '@server/kratos'
import { useMiddlewares } from '@server/middlewares'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'DELETE':
      await useMiddlewares(
        [useErrorMiddleware, useAuthorizeAdminMiddleware],
        req,
        res,
        async () => {
          const { uid } = req.query

          const cookie = req.headers.cookie
          const session = await kratos.toSession(undefined, cookie)
          if (session.data.id === uid) {
            throw forbiddenError('You can not delete yourself')
          }

          const kratosRes = await kratos.adminDeleteIdentity(uid as string)
          res.status(kratosRes.status).end()
        },
      )
      break
    default:
      res.status(405).end()
      break
  }
}
