import { NextApiRequest, NextApiResponse } from 'next'
import { validateCaptcha } from '@server/captcha'
import {
  internalError,
  invalidParameter,
  missingParameter,
  useErrorMiddleware,
} from '@server/error-middleware'
import kratos from '@server/kratos'
import { LoginDto } from '@server/models'
import { forwardCookieToResponse, isDyoError } from '@app/utils'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST':
      await useErrorMiddleware(req, res, async () => {
        const dto = req.body as LoginDto
        if (!dto.captcha) {
          throw missingParameter('captcha')
        }

        const captcha = await validateCaptcha(dto.captcha)
        if (!captcha) {
          throw invalidParameter('captcha')
        }

        const cookie = req.headers.cookie
        if (!cookie) {
          throw internalError('Cookie is missing')
        }

        try {
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
        } catch (error) {
          if (isDyoError(error)) {
            throw error
          }

          res.status(error.response.status).json(error.response.data)
        }
      })
      break
    default:
      res.status(405).end()
      break
  }
}
