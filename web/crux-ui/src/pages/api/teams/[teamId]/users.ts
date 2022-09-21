import { InviteUser } from '@app/models'
import { inviteUserSchema } from '@app/validations'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamId = req.query.teamId as string
  const dto = req.body as InviteUser

  const user = await crux(req).teams.inviteUser(teamId, dto)

  res.status(200).json(user)
}

export default withMiddlewares({
  onPost: {
    middlewares: [useValidationMiddleware(inviteUserSchema)],
    endpoint: onPost,
  },
})
