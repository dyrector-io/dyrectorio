import { DyoNodeGenerateScript } from '@app/models'
import { nodeGenerateScriptSchema as nodeTypeValidationSchema } from '@app/validations'
import crux from '@server/crux/crux'
import { nodeScriptTypeUiToGrpc, nodeTraefikOptionsToProto, nodeTypeUiToGrpc } from '@server/crux/mappers/node-mappers'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const nodeId = req.query.nodeId as string
  const generateScript = req.body as DyoNodeGenerateScript

  const dto = await crux(req).nodes.generateScript(
    nodeId,
    nodeTypeUiToGrpc(generateScript.type),
    nodeScriptTypeUiToGrpc(generateScript.scriptType),
    generateScript.rootPath,
    generateScript.traefik ? nodeTraefikOptionsToProto(generateScript.traefik) : undefined,
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
