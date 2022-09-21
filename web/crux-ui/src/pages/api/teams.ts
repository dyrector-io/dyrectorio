import { CreateTeam } from '@app/models'
import { createTeamSchema } from '@app/validations'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as CreateTeam

  const team = await crux(req).teams.createTeam(dto)

  res.status(200).json(team)
}

export default withMiddlewares({
  onPost: {
    middlewares: [useValidationMiddleware(createTeamSchema)],
    endpoint: onPost,
  },
})
