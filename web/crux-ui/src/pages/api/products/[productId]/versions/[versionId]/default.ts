import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPut = async (req: NextApiRequest, res: NextApiResponse) => {
  const versionId = req.query.versionId as string

  await crux(req).versions.setDefault(versionId)

  res.status(204).end()
}

export default withMiddlewares({
  onPut,
})
