import { UpdateNotification } from '@app/models'
import { notificationSchema } from '@app/validation'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { useValidationMiddleware } from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPut = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as UpdateNotification

  await crux(req).notificiations.update(dto)

  res.status(204).end()
}

const onDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.notificationId as string

  await crux(req).notificiations.delete(id)

  res.status(204).end()
}

export default withMiddlewares({
  onPut: {
    endpoint: onPut,
    middlewares: [useValidationMiddleware(notificationSchema)],
  },
  onDelete: onDelete,
})
