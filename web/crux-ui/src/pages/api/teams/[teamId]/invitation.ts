import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPut = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamId = req.query.teamId as string
  await crux(req).teams.acceptInvitation(teamId)

  res.status(204).end()
}

const onDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamId = req.query.teamId as string
  await crux(req).teams.declineInvitation(teamId)

  res.status(204).end()
}

export default withMiddlewares({
  onPut,
  onDelete,
})
