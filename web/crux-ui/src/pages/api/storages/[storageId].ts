import { UpdateStorage } from '@app/models'
import { storageSchema } from '@app/validations/storage'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPut = async (req: NextApiRequest, res: NextApiResponse) => {
  const storageId = req.query.storageId as string
  const dto = req.body as UpdateStorage

  await crux(req).storage.update(storageId, dto)

  res.status(204).end()
}

const onDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const storageId = req.query.storageId as string

  await crux(req).storage.delete(storageId)

  res.status(204).end()
}

export default withMiddlewares({
  onPut: {
    middlewares: [useValidationMiddleware(storageSchema)],
    endpoint: onPut,
  },
  onDelete,
})
