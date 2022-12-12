import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await crux(req).dashboard.getDashboard()

  res.status(200).json(data)
}

export default withMiddlewares({
  onGet,
})
