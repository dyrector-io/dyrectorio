import { UpdateDeployment } from '@app/models'
import { updateDeploymentSchema } from '@app/validation'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { useValidationMiddleware } from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPut = async (req: NextApiRequest, res: NextApiResponse) => {
  const deploymentId = req.query.deploymentId as string
  const dto = req.body as UpdateDeployment

  await crux(req).deployments.update(deploymentId, dto)

  res.status(204).end()
}

const onDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const deploymentId = req.query.deploymentId as string

  await crux(req).deployments.delete(deploymentId)

  res.status(204).end()
}

export default withMiddlewares({
  onPut: {
    middlewares: [useValidationMiddleware(updateDeploymentSchema)],
    endpoint: onPut,
  },
  onDelete,
})
