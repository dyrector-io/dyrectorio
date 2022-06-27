import { NextApiRequest, NextApiResponse } from 'next'
import { userIsAdmin } from '@server/auth-middleware'
import { useErrorMiddleware } from '@server/error-middleware'
import kratos from '@server/kratos'
import { UserDto } from '@server/models'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST':
      await useErrorMiddleware(req, res, async () => {
        const cookie = req.headers.cookie
        const session = await kratos.toSession(undefined, cookie)

        const identity = session.data.identity
        const dto: UserDto = {
          identity,
          admin: userIsAdmin(identity),
        }

        res.status(200).json(dto)
      })
      break
    default:
      res.status(405).end()
      break
  }
}
