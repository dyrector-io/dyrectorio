import { Login } from '@app/models'
import { validateCaptcha } from '@server/captcha'
import { useErrorMiddleware } from '@server/error-middleware'
import kratos, { cookieOf, forwardCookieToResponse } from '@server/kratos'
import useKratosErrorMiddleware from '@server/kratos-error-middleware'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as Login
  await validateCaptcha(dto.captcha)
  const cookie = cookieOf(req)

  const kratosRes = await kratos.submitSelfServiceLoginFlow(
    dto.flow,
    {
      method: 'password',
      csrf_token: dto.csrfToken,
      identifier: dto.email,
      password: dto.password,
    },
    undefined,
    cookie,
  )

  forwardCookieToResponse(res, kratosRes)

  res.status(kratosRes.status).end()
}

export default withMiddlewares(
  {
    onPost,
  },
  [useErrorMiddleware, useKratosErrorMiddleware],
  false,
)
