import { IncreaseVersion } from '@app/models'
import { increaseVersionSchema } from '@app/validations'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const versionId = req.query.versionId as string
  const dto = req.body as IncreaseVersion

  const version = await crux(req).versions.increase(versionId, dto)

  res.status(201).json(version)
}

export default withMiddlewares({
  onPost: {
    middlewares: [useValidationMiddleware(increaseVersionSchema)],
    endpoint: onPost,
  },
})
