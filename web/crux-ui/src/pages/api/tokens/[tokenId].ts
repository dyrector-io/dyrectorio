import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const tokenid = req.query.tokenId as string

  await crux(req).token.delete(tokenid)

  res.status(204).end()
}

export default withMiddlewares({
  onDelete,
})
