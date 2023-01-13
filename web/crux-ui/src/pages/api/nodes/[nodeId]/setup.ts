import { NodeInstallScriptType, NodeType } from '@app/models'
import { nodeType as nodeTypeValidationSchema } from '@app/validations'
import crux from '@server/crux/crux'
import { nodeScriptTypeUiToGrpc, nodeTypeUiToGrpc } from '@server/crux/mappers/node-mappers'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const nodeId = req.query.nodeId as string
  const nodeType = req.body.type as NodeType
  const rootPath = req.body.rootPath as string
  const scriptType = req.body.scriptType as NodeInstallScriptType

  const dto = await crux(req).nodes.generateScript(
    nodeId,
    nodeTypeUiToGrpc(nodeType),
    nodeScriptTypeUiToGrpc(scriptType),
    rootPath,
  )
  res.json(dto)
}

const onDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const nodeId = req.query.nodeId as string

  await crux(req).nodes.discardScript(nodeId)
  res.status(204).end()
}

export default withMiddlewares({
  onPost: {
    middlewares: [useValidationMiddleware(nodeTypeValidationSchema)],
    endpoint: onPost,
  },
  onDelete,
})
