import { IdentityTraits, Register } from '@app/models'
import { registerSchema } from '@app/validations'
import { validateCaptcha } from '@server/captcha'
import { useErrorMiddleware } from '@server/error-middleware'
import kratos, { forwardCookieToResponse } from '@server/kratos'
import useKratosErrorMiddleware from '@server/kratos-error-middleware'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as Register
  await validateCaptcha(dto.captcha)

  const { cookie } = req.headers

  const traits: IdentityTraits = {
    email: dto.email,
    name: {
      first: dto.firstName,
      last: dto.lastName,
    },
  }

  const kratosRes = await kratos.submitSelfServiceRegistrationFlow(
    dto.flow,
    {
      csrf_token: dto.csrfToken,
      method: 'password',
      password: dto.password,
      traits,
    },
    cookie,
  )

  forwardCookieToResponse(res, kratosRes)

  res.status(kratosRes.status).end()
}

export default withMiddlewares(
  {
    onPost: {
      endpoint: onPost,
      middlewares: [useValidationMiddleware(registerSchema)],
    },
  },
  [useErrorMiddleware, useKratosErrorMiddleware],
  false,
)
