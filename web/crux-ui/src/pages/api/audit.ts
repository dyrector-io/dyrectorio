import { AuditLogListRequest } from '@app/models'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as AuditLogListRequest

  const auditLog = await crux(req).audit.getAuditLog(dto)

  res.status(200).json(auditLog)
}

export default withMiddlewares({
  onPost,
})
