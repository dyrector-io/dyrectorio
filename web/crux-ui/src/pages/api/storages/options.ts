import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const options = await crux(req).storage.getOptions()

  res.status(200).json(options)
}

export default withMiddlewares({
  onGet,
})
