import { CopyDeploymentResponse } from '@app/models'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const deploymentId = req.query.deploymentId as string
  const overwrite = req.query.overwrite === 'true'

  try {
    const newDeploymentId = await crux(req).deployments.copyDeployment(deploymentId, overwrite)

    const response = {
      id: newDeploymentId,
    } as CopyDeploymentResponse

    res.status(200).json(response)
  } catch (err) {
    if (err.status === 412) {
      res.status(412).end()
    } else {
      throw err
    }
  }
}

export default withMiddlewares({
  onPost,
})
