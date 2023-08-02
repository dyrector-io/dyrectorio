import { HEADER_LOCATION } from '@app/const'
import { invalidArgument } from '@app/error-responses'
import { IdentityTraits, Register, toKratosLocationChangeRequiredError } from '@app/models'
import { registerSchema } from '@app/validations'
import {
  UpdateRegistrationFlowBody,
  UpdateRegistrationFlowWithOidcMethod,
  UpdateRegistrationFlowWithPasswordMethod,
} from '@ory/kratos-client'
import { validateCaptcha } from '@server/captcha'
import { forwardCookieToResponse } from '@server/cookie'
import { useErrorMiddleware } from '@server/error-middleware'
import kratos from '@server/kratos'
import useKratosErrorMiddleware from '@server/kratos-error-middleware'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const dtoToKratosBody = (dto: Register): UpdateRegistrationFlowBody => {
  switch (dto.method) {
    case 'password': {
      const traits: IdentityTraits = {
        email: dto.email,
        name: {
          first: dto.firstName,
          last: dto.lastName,
        },
      }

      const body: UpdateRegistrationFlowWithPasswordMethod = {
        csrf_token: dto.csrfToken,
        method: 'password',
        password: dto.password,
        traits,
      }

      return body
    }
    case 'oidc': {
      const body: UpdateRegistrationFlowWithOidcMethod = {
        method: 'oidc',
        provider: dto.provider,
        csrf_token: dto.csrfToken,
        traits:
          dto.firstName || dto.lastName
            ? {
                name: {
                  first: dto.firstName,
                  last: dto.lastName,
                },
              }
            : null,
      }

      return body
    }
    default:
      throw invalidArgument('method', 'Invalid registration method')
  }
}

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as Register
  await validateCaptcha(dto.captcha)

  const { cookie } = req.headers

  const body = dtoToKratosBody(dto)

  try {
    const kratosRes = await kratos.updateRegistrationFlow({
      flow: dto.flow,
      updateRegistrationFlowBody: body,
      cookie,
    })

    forwardCookieToResponse(res, kratosRes)
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
    onPost: {
      endpoint: onPost,
      middlewares: [useValidationMiddleware(registerSchema)],
    },
  },
  [useErrorMiddleware, useKratosErrorMiddleware],
  false,
)
