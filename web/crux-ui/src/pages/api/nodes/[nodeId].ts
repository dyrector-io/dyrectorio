import { UpdateDyoNode } from '@app/models'
import { nodeSchema } from '@app/validation'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const nodeId = req.query.nodeId as string
  const node = await crux(req).nodes.getNodeDetails(nodeId)

  res.status(200).json(node)
}

const onPut = async (req: NextApiRequest, res: NextApiResponse) => {
  const nodeId = req.query.nodeId as string
  const dto = req.body as UpdateDyoNode

  await crux(req).nodes.update(nodeId, dto)

  res.status(204).end()
}

const onDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const nodeId = req.query.nodeId as string

  await crux(req).nodes.delete(nodeId)

  res.status(204).end()
}

export default withMiddlewares({
  onGet,
  onDelete,
  onPut: {
    middlewares: [useValidationMiddleware(nodeSchema)],
    endpoint: onPut,
  },
})
