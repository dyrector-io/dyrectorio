import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const templateId = req.query.templateId as string

  const data = await crux(req).templates.getImage(templateId)

  res.status(200).setHeader('Content-Type', 'image/png').send(data.data)
}

export default withMiddlewares({
  onGet,
})
