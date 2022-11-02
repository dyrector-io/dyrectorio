import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const deploymentId = req.query.deploymentId as string

  await crux(req).deployments.startDeployment(deploymentId)

  res.status(204).end()
}

export default withMiddlewares({
  onPost,
})
