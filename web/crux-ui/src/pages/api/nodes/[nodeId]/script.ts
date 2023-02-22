import { Crux } from '@server/crux/crux'
import { useErrorMiddleware } from '@server/error-middleware'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'
import { Readable } from 'stream'

const onGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const nodeId = req.query.nodeId as string

  const dto = await Crux.withIdentity(null, null).nodes.getScript(nodeId)

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Length': dto.content.length,
  })

  const readable = Readable.from(dto.content)
  readable.pipe(res)
}

export default withMiddlewares(
  {
    onGet,
  },
  [useErrorMiddleware],
  false,
)
