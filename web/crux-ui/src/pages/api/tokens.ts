import { GenerateTokenRequest } from '@app/models'
import { generateTokenSchema } from '@app/validations/token'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as GenerateTokenRequest
  const token = await crux(req).token.generateToken(dto)

  res.status(201).json(token)
}

export default withMiddlewares({
  onPost: {
    middlewares: [useValidationMiddleware(generateTokenSchema)],
    endpoint: onPost,
  },
})
