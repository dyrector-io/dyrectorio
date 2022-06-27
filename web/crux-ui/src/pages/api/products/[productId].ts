import { UpdateProduct } from '@app/models'
import { updateProductSchema } from '@app/validation'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { useValidationMiddleware } from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPut = async (req: NextApiRequest, res: NextApiResponse) => {
  const productId = req.query.productId as string
  const dto = req.body as UpdateProduct

  await crux(req).products.update(productId, dto)

  res.status(204).end()
}

const onDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const productId = req.query.productId as string

  await crux(req).products.delete(productId)

  res.status(204).end()
}

export default withMiddlewares({
  onPut: {
    middlewares: [useValidationMiddleware(updateProductSchema)],
    endpoint: onPut,
  },
  onDelete,
})
