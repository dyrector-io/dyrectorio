import { CruxUiGenerateScriptRequest, nodeTypeUiToGrpc } from '@app/models'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: CruxUiGenerateScriptRequest, res: NextApiResponse) => {
  const nodeId = req.query.nodeId as string

  const dto = await crux(req).nodes.generateScript(nodeId, nodeTypeUiToGrpc(req.body.type))
  res.json(dto)
}

const onDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const nodeId = req.query.nodeId as string

  await crux(req).nodes.discardScript(nodeId)
  res.status(204).end()
}

export default withMiddlewares({
  onPost,
  onDelete,
})
