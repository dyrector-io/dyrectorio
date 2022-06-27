import { CreateDyoNode } from '@app/models'
import { nodeSchema } from '@app/validation'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { useValidationMiddleware } from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const nodes = await crux(req).nodes.getAll()

  res.status(200).json(nodes)
}

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as CreateDyoNode

  const node = await crux(req).nodes.create(dto)

  res.status(201).json(node)
}

export default withMiddlewares({
  onGet,
  onPost: {
    middlewares: [useValidationMiddleware(nodeSchema)],
    endpoint: onPost,
  },
})
