import { UpdateRegistry } from '@app/models'
import { registrySchema } from '@app/validation'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPut = async (req: NextApiRequest, res: NextApiResponse) => {
  const registryId = req.query.registryId as string
  const dto = req.body as UpdateRegistry

  await crux(req).registries.update(registryId, dto)

  res.status(204).end()
}

const onDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const registryId = req.query.registryId as string

  await crux(req).registries.delete(registryId)

  res.status(204).end()
}

export default withMiddlewares({
  onPut: {
    middlewares: [useValidationMiddleware(registrySchema)],
    endpoint: onPut,
  },
  onDelete,
})
