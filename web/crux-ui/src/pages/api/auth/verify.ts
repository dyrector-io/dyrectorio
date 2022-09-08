import { VerifyEmail } from '@app/models'
import { validateCaptcha } from '@server/captcha'
import kratos, { cookieOf } from '@server/kratos'
import useKratosErrorMiddleware from '@server/kratos-error-middleware'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as VerifyEmail
  await validateCaptcha(dto.captcha)

  const cookie = cookieOf(req)

  const kratosRes = await kratos.submitSelfServiceVerificationFlow(
    dto.flow,
    {
      csrf_token: dto.csrfToken,
      method: 'link',
      email: dto.email,
    },
    dto.token,
    cookie,
  )

  res.status(kratosRes.status).end()
}

export default withMiddlewares(
  {
    onPost,
  },
  [useKratosErrorMiddleware],
)
