import { HEADER_LOCATION } from '@app/const'
import { RecoverEmail, toKratosLocationChangeRequiredError } from '@app/models'
import { UpdateRecoveryFlowWithCodeMethod } from '@ory/kratos-client'
import { validateCaptcha } from '@server/captcha'
import { cookieOf, forwardCookieToResponse } from '@server/cookie'
import { useErrorMiddleware } from '@server/error-middleware'
import kratos, { flowOfUrl, identityRecovered, obtainSessionFromResponse } from '@server/kratos'
import useKratosErrorMiddleware from '@server/kratos-error-middleware'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as RecoverEmail
  await validateCaptcha(dto.captcha)

  const cookie = cookieOf(req)

  const { code } = dto

  const body: UpdateRecoveryFlowWithCodeMethod = {
    csrf_token: dto.csrfToken,
    method: 'code',
    email: !code ? dto.email : null,
    code,
  }

  try {
    const kratosRes = await kratos.updateRecoveryFlow({
      flow: dto.flow,
      cookie,
      updateRecoveryFlowBody: body,
    })

    res.status(kratosRes.status).json(kratosRes.data)
  } catch (err) {
    const error = toKratosLocationChangeRequiredError(err)
    if (error) {
      forwardCookieToResponse(res, error)
      const settingsFlow = flowOfUrl(error.data.redirect_browser_to)

      const session = await obtainSessionFromResponse(error)
      await identityRecovered(session, settingsFlow)

      res.status(201).setHeader(HEADER_LOCATION, error.data.redirect_browser_to).end()
      return
    }

    throw err
  }
}

export default withMiddlewares(
  {
    onPost,
  },
  [useErrorMiddleware, useKratosErrorMiddleware],
  false,
)
