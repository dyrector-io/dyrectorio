import { UpdateTeam } from '@app/models'
import { updateTeamSchema } from '@app/validation'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { useValidationMiddleware } from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamId = req.query.teamId as string

  const team = await crux(req).teams.getTeamById(teamId)

  res.status(200).json(team)
}

const onPut = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamId = req.query.teamId as string
  const dto = req.body as UpdateTeam

  await crux(req).teams.updateTeam(teamId, dto)

  res.status(204).end()
}

const onDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamId = req.query.teamId as string

  await crux(req).teams.deleteTeam(teamId)

  res.status(204).end()
}

export default withMiddlewares({
  onGet,
  onPut: {
    middlewares: [useValidationMiddleware(updateTeamSchema)],
    endpoint: onPut,
  },
  onDelete,
})
