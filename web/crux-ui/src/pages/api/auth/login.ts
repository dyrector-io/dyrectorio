import { HEADER_LOCATION } from '@app/const'
import { invalidArgument } from '@app/error-responses'
import { AxiosErrorResponse, Login, toKratosLocationChangeRequiredError } from '@app/models'
import {
  LoginFlow,
  UiContainer,
  UpdateLoginFlowBody,
  UpdateLoginFlowWithOidcMethod,
  UpdateLoginFlowWithPasswordMethod,
} from '@ory/kratos-client'
import { validateCaptcha } from '@server/captcha'
import { cookieOf, forwardCookieToResponse } from '@server/cookie'
import { useErrorMiddleware } from '@server/error-middleware'
import kratos, { identityPasswordSet, obtainSessionFromResponse } from '@server/kratos'
import useKratosErrorMiddleware from '@server/kratos-error-middleware'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const LOGIN_DETECTED = 'A valid session was detected and thus login is not possible.'

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

const isAlreadyLoggedIn = (res: AxiosErrorResponse<LoginFlow>): boolean => {
  if (!res.data.ui) {
    return false
  }

  const newUi = res.data.ui as UiContainer
  // TODO(@robot9706): this is the best solution I found
  return newUi.messages.some(it => it.id === 4000001 && it.text.startsWith(LOGIN_DETECTED))
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
    const flowResponse = err.response as AxiosErrorResponse<LoginFlow>
    if (isAlreadyLoggedIn(flowResponse)) {
      forwardCookieToResponse(res, err.response)
      res.status(409).end()
      return
    }

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
