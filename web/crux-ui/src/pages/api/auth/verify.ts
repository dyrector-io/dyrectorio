import { VerifyEmail } from '@app/models'
import { UpdateVerificationFlowWithLinkMethod } from '@ory/kratos-client'
import { validateCaptcha } from '@server/captcha'
import { useErrorMiddleware } from '@server/error-middleware'
import kratos, { cookieOf } from '@server/kratos'
import useKratosErrorMiddleware from '@server/kratos-error-middleware'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as VerifyEmail
  await validateCaptcha(dto.captcha)

  const cookie = cookieOf(req)

  const body: UpdateVerificationFlowWithLinkMethod = {
    csrf_token: dto.csrfToken,
    method: 'link',
    email: dto.email,
  }

  const kratosRes = await kratos.updateVerificationFlow({
    flow: dto.flow,
    token: dto.token,
    cookie,
    updateVerificationFlowBody: body,
  })

  res.status(kratosRes.status).end()
}

export default withMiddlewares(
  {
    onPost,
  },
  [useErrorMiddleware, useKratosErrorMiddleware],
  false,
)
