import { UpdateVersion } from '@app/models'
import { updateVersionSchema } from '@app/validations'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPut = async (req: NextApiRequest, res: NextApiResponse) => {
  const versionId = req.query.versionId as string
  const dto = req.body as UpdateVersion

  await crux(req).versions.update(versionId, dto)

  res.status(204).end()
}

const onDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const versionId = req.query.versionId as string

  await crux(req).versions.delete(versionId)

  res.status(204).end()
}

export default withMiddlewares({
  onPut: {
    middlewares: [useValidationMiddleware(updateVersionSchema)],
    endpoint: onPut,
  },
  onDelete,
})
