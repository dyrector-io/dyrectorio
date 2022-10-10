import { CheckDeploymentCopyResponse, CopyDeploymentResponse } from '@app/models'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const deploymentId = req.query.deploymentId as string

  const pendingDeployment = await crux(req).deployments.checkCopy(deploymentId)

  const response = {
    pendingDeployment,
  } as CheckDeploymentCopyResponse

  res.status(200).json(response)
}

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const deploymentId = req.query.deploymentId as string

  const newDeployment = await crux(req).deployments.copyDeployment(deploymentId)

  const response = {
    id: newDeployment,
  } as CopyDeploymentResponse

  res.status(200).json(response)
}

export default withMiddlewares({
  onGet,
  onPost,
})
