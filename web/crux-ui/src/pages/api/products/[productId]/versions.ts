import { CreateVersion } from '@app/models'
import { createVersionSchema } from '@app/validation'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const productId = req.query.productId as string
  const dto = req.body as CreateVersion

  const version = await crux(req).versions.create(productId, dto)

  res.status(201).json(version)
}

export default withMiddlewares({
  onPost: {
    middlewares: [useValidationMiddleware(createVersionSchema)],
    endpoint: onPost,
  },
})
