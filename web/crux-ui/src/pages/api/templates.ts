import { ApplyTemplate } from '@app/models/template'
import { applyTemplateSchema } from '@app/validations'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as ApplyTemplate
  const product = await crux(req).templates.createProductFromTemplate(dto)

  res.status(201).json(product)
}

export default withMiddlewares({
  onPost: {
    middlewares: [useValidationMiddleware(applyTemplateSchema)],
    endpoint: onPost,
  },
})
