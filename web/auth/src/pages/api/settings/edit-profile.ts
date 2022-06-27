import { NextApiRequest, NextApiResponse } from 'next'
import { useErrorMiddleware } from '@server/error-middleware'
import kratos from '@server/kratos'
import { EditProfileDto } from '@server/models'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST':
      await useErrorMiddleware(req, res, async () => {
        const dto = req.body as EditProfileDto

        const cookie = req.headers.cookie

        try {
          const kratosRes = await kratos.submitSelfServiceSettingsFlow(
            dto.flow,
            {
              method: 'profile',
              csrf_token: dto.csrfToken,
              traits: {
                email: dto.email,
                name: {
                  first: dto.firstName,
                  last: dto.lastName,
                },
              },
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
