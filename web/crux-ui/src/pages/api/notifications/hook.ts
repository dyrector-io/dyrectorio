import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const url = req.body as string

  const result = await crux(req).notificiations.testNotification(url)

  res.status(200).json(result)
}

export default withMiddlewares({
  onPost: onPost,
})
