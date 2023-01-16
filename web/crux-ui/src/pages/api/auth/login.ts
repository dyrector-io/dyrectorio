import { Login } from '@app/models'
import { UpdateLoginFlowWithPasswordMethod } from '@ory/kratos-client'
import { validateCaptcha } from '@server/captcha'
import { useErrorMiddleware } from '@server/error-middleware'
import kratos, {
  cookieOf,
  forwardCookieToResponse,
  identityPasswordSet,
  obtainSessionFromResponse,
} from '@server/kratos'
import useKratosErrorMiddleware from '@server/kratos-error-middleware'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as Login
  await validateCaptcha(dto.captcha)
  const cookie = cookieOf(req)

  const body: UpdateLoginFlowWithPasswordMethod = {
    method: 'password',
    csrf_token: dto.csrfToken,
    identifier: dto.email,
    password: dto.password,
  }

  const kratosRes = await kratos.updateLoginFlow({
    flow: dto.flow,
    updateLoginFlowBody: body,
    cookie,
  })

  forwardCookieToResponse(res, kratosRes)

  const session = await obtainSessionFromResponse(kratosRes)
  await identityPasswordSet(session)

  res.status(kratosRes.status).end()
}

export default withMiddlewares(
  {
    onPost,
  },
  [useErrorMiddleware, useKratosErrorMiddleware],
  false,
)
