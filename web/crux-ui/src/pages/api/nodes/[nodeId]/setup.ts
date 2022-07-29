import { NodeType } from '@app/models'
import { nodeType } from '@app/validation'
import crux from '@server/crux/crux'
import { nodeTypeUiToGrpc } from '@server/crux/node-service'
import { withMiddlewares } from '@server/middlewares'
import { useValidationMiddleware } from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const nodeId = req.query.nodeId as string
  const nodeType = req.body.type as NodeType

  const dto = await crux(req).nodes.generateScript(nodeId, nodeTypeUiToGrpc(nodeType))
  res.json(dto)
}

const onDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const nodeId = req.query.nodeId as string

  await crux(req).nodes.discardScript(nodeId)
  res.status(204).end()
}

export default withMiddlewares({
  onPost: {
    middlewares: [useValidationMiddleware(nodeType)],
    endpoint: onPost,
  },
  onDelete,
})
