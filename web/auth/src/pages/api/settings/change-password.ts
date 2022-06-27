import { NextApiRequest, NextApiResponse } from 'next'
import { useErrorMiddleware } from '@server/error-middleware'
import kratos from '@server/kratos'
import { ChangePasswordDto } from '@server/models'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST':
      await useErrorMiddleware(req, res, async () => {
        const dto = req.body as ChangePasswordDto

        const cookie = req.headers.cookie
        try {
          const kratosRes = await kratos.submitSelfServiceSettingsFlow(
            dto.flow,
            {
              method: 'password',
              csrf_token: dto.csrfToken,
              password: dto.password,
            },
            undefined,
            cookie,
          )

          res.status(kratosRes.status).end()
        } catch (error) {
          res.status(error.response.status).json(error.response.data)
        }
      })
      break
    default:
      res.status(405).end()
      break
  }
}
