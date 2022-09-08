import { UserRole } from '@app/models'
import { roleSchema } from '@app/validation'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPut = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamId = req.query.teamId as string
  const userId = req.query.userId as string
  const role = req.body as UserRole

  await crux(req).teams.updateUserRole(teamId, userId, role)

  res.status(204).end()
}

export default withMiddlewares({
  onPut: {
    middlewares: [useValidationMiddleware(roleSchema)],
    endpoint: onPut,
  },
})
