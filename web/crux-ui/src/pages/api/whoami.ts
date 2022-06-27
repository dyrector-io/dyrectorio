import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const meta = await crux(req).teams.getUserMeta()

  res.status(200).json(meta)
}

export default withMiddlewares({
  onPost,
})
