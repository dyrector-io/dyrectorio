import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.notificationId as string

  await crux(req).notificiations.testNotification(id)

  res.status(204).end()
}

export default withMiddlewares({
  onPost: onPost,
})
