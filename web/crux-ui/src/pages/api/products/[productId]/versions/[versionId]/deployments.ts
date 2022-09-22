import { CreateDeployment, DeploymentCreated } from '@app/models'
import { createDeploymentSchema } from '@app/validations'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const versionId = req.query.versionId as string

  const deployments = await crux(req).deployments.getAllByVersionId(versionId)

  res.status(200).json(deployments)
}

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const versionId = req.query.versionId as string
  const dto = req.body as CreateDeployment

  const id = await crux(req).deployments.create(versionId, dto)

  res.status(201).json({
    id,
  } as DeploymentCreated) // TODO fix this with Deployment as a response
}

export default withMiddlewares({
  onGet,
  onPost: {
    middlewares: [useValidationMiddleware(createDeploymentSchema)],
    endpoint: onPost,
  },
})
