import { SelectTeam } from '@app/models'
import { selectTeamSchema } from '@app/validations'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const team = await crux(req).teams.getActiveTeam()

  res.status(200).json(team)
}

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as SelectTeam

  await crux(req).teams.selectTeam(dto.id)

  res.status(204).end()
}

export default withMiddlewares({
  onGet,
  onPost: {
    middlewares: [useValidationMiddleware(selectTeamSchema)],
    endpoint: onPost,
  },
})
