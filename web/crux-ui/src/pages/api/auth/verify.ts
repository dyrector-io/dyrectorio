import { VerifyEmail } from '@app/models'
import { UpdateVerificationFlowBody, UpdateVerificationFlowWithCodeMethod } from '@ory/kratos-client'
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

  const { code } = dto

  const body: UpdateVerificationFlowWithCodeMethod = {
    csrf_token: dto.csrfToken,
    method: 'code',
    email: !code ? dto.email : null,
    code,
  }

  const kratosRes = await kratos.updateVerificationFlow({
    flow: dto.flow,
    cookie,
    updateVerificationFlowBody: body as UpdateVerificationFlowBody,
  })

  res.status(kratosRes.status).json(kratosRes.data)
}

export default withMiddlewares(
  {
    onPost,
  },
  [useErrorMiddleware, useKratosErrorMiddleware],
  false,
)
