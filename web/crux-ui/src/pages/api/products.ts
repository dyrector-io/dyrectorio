import { CreateProduct } from '@app/models'
import { createProductSchema } from '@app/validation'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { useValidationMiddleware } from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as CreateProduct
  const product = await crux(req).products.create(dto)

  res.status(201).json(product)
}

export default withMiddlewares({
  onPost: {
    middlewares: [useValidationMiddleware(createProductSchema)],
    endpoint: onPost,
  },
})
