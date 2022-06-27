import { NextApiRequest, NextApiResponse } from 'next'
import { useErrorMiddleware } from '@server/error-middleware'
import kratos from '@server/kratos'
import { LogoutDto } from '@server/models'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST':
      await useErrorMiddleware(req, res, async () => {
        const cookie = req.headers.cookie

        if (!cookie) {
          res.status(401).end()
          return
        }

        try {
          const kratosRes =
            await kratos.createSelfServiceLogoutFlowUrlForBrowsers(cookie)
          const dto: LogoutDto = {
            url: kratosRes.data.logout_url,
          }

          res.status(200).json(dto)
        } catch (e) {
          if (e.status === 401) {
            res.status(401).end()
            return
          }

          throw e
        }
      })
      break
    default:
      res.status(405).end()
      break
  }
}
