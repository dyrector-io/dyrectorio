import { HEADER_LOCATION } from '@app/const'
import { invalidArgument } from '@app/error-responses'
import { Login, toKratosLocationChangeRequiredError } from '@app/models'
import {
  UpdateLoginFlowBody,
  UpdateLoginFlowWithOidcMethod,
  UpdateLoginFlowWithPasswordMethod,
} from '@ory/kratos-client'
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

const dtoToKratosBody = (dto: Login): UpdateLoginFlowBody => {
  switch (dto.method) {
    case 'password': {
      const body: UpdateLoginFlowWithPasswordMethod = {
        method: 'password',
        csrf_token: dto.csrfToken,
        identifier: dto.email,
        password: dto.password,
      }

      return body
    }
    case 'oidc': {
      const body: UpdateLoginFlowWithOidcMethod = {
        method: 'oidc',
        provider: dto.provider,
        csrf_token: dto.csrfToken,
      }

      return body
    }
    default:
      throw invalidArgument('method', 'Invalid login method')
  }
}

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as Login
  await validateCaptcha(dto.captcha)

  const cookie = cookieOf(req)

  const body = dtoToKratosBody(dto)

  try {
    const kratosRes = await kratos.updateLoginFlow({
      flow: dto.flow,
      updateLoginFlowBody: body,
      cookie,
    })

    forwardCookieToResponse(res, kratosRes)

    const session = await obtainSessionFromResponse(kratosRes)
    await identityPasswordSet(session)

    res.status(kratosRes.status).end()
  } catch (err) {
    const error = toKratosLocationChangeRequiredError(err)

    if (!error) {
      throw err
    }

    forwardCookieToResponse(res, error)
    res.status(201).setHeader(HEADER_LOCATION, error.data.redirect_browser_to).end()
  }
}

export default withMiddlewares(
  {
    onPost,
  },
  [useErrorMiddleware, useKratosErrorMiddleware],
  false,
)
