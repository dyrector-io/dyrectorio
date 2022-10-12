import { CopyDeploymentResponse } from '@app/models'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const deploymentId = req.query.deploymentId as string
  const forceCopy = req.query.force === '1'

  try {
    const newDeployment = await crux(req).deployments.copyDeployment(deploymentId, forceCopy)

    const response = {
      id: newDeployment,
    } as CopyDeploymentResponse

    res.status(200).json(response)
  } catch (e) {
    if (e.status === 412) {
      res.status(412).end()
    } else {
      throw e
    }
  }
}

export default withMiddlewares({
  onPost,
})
