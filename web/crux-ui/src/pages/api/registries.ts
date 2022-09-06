import { CreateRegistry } from '@app/models'
import { registrySchema } from '@app/validation'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const registries = await crux(req).registries.getAll()

  res.status(200).json(registries)
}

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as CreateRegistry

  const registry = await crux(req).registries.create(dto)

  res.status(201).json(registry)
}

export default withMiddlewares({
  onGet,
  onPost: {
    middlewares: [useValidationMiddleware(registrySchema)],
    endpoint: onPost,
  },
})
