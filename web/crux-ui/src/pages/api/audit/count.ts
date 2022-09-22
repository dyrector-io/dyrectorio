import { AuditLogListRequest } from '@app/models'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as AuditLogListRequest

  const count = await crux(req).audit.getAuditLogListCount(dto)

  res.status(200).json(count)
}

export default withMiddlewares({
  onPost,
})
