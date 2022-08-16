import { CreateNotification } from '@app/models'
import { notificationSchema } from '@app/validation'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { useValidationMiddleware } from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const notifications = await crux(req).notificiations.getAll()

  res.status(200).json(notifications)
}

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as CreateNotification

  const notification = await crux(req).notificiations.create(dto)

  res.status(200).json(notification)
}

export default withMiddlewares({
  onGet: onGet,
  onPost: {
    middlewares: [useValidationMiddleware(notificationSchema)],
    endpoint: onPost,
  },
})
