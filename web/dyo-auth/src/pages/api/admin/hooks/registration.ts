import { NextApiRequest, NextApiResponse } from 'next'
import { useAuthorizeApiMiddleware } from '@server/auth-middleware'
import { useErrorMiddleware } from '@server/error-middleware'
import { useMiddlewares } from '@server/middlewares'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST':
      await useMiddlewares(
        [useErrorMiddleware, useAuthorizeApiMiddleware],
        req,
        res,
        async () => {
          res.status(503).end()
        },
      )
      break
    default:
      res.status(405).end()
      break
  }
}
