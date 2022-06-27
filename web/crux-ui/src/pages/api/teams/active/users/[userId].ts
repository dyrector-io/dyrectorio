import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = req.query.userId as string

  await crux(req).teams.deleteUser(userId)

  res.status(204).end()
}

export default withMiddlewares({
  onDelete,
})
