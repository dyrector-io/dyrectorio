import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const nodeId = req.query.nodeId as string

  await crux(req).nodes.revokeToken(nodeId)
  res.status(204).end()
}

export default withMiddlewares({
  onDelete,
})
