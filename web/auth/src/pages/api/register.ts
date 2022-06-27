import { NextApiRequest, NextApiResponse } from 'next'
import { validateCaptcha } from '@server/captcha'
import {
  invalidParameter,
  missingParameter,
  useErrorMiddleware,
} from '@server/error-middleware'
import kratos from '@server/kratos'
import { RegisterDto } from '@server/models'
import { forwardCookieToResponse } from '@app/utils'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST':
      await useErrorMiddleware(req, res, async () => {
        const dto = req.body as RegisterDto
        if (!dto.captcha) {
          throw missingParameter('captcha')
        }

        const captcha = await validateCaptcha(dto.captcha)
        if (!captcha) {
          throw invalidParameter('captcha')
        }

        const cookie = req.headers.cookie
        try {
          const kratosRes = await kratos.submitSelfServiceRegistrationFlow(
            dto.flow,
            {
              csrf_token: dto.csrfToken,
              method: 'password',
              password: dto.password,
              traits: {
                email: dto.email,
              },
            },
            cookie,
          )

          forwardCookieToResponse(res, kratosRes)

          res.status(kratosRes.status).end()
        } catch (error) {
          res.status(error.response.status).json(error.response.data)
        }
      })
      break
    default:
      res.status(405).end()
      break
  }
}
