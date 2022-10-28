import { preconditionFailedError } from '@app/error-responses'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const deploymentId = req.query.deploymentId as string
  try {
    await crux(req).deployments.startDeployment(deploymentId)

    res.status(200).end()
  } catch (err) {
    if (err.status !== 412) {
      throw err
    }

    res.status(412).json(preconditionFailedError(err.property, err.description, err.value))
  }
}

export default withMiddlewares({
  onPost,
})
