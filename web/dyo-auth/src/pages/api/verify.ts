import { NextApiRequest, NextApiResponse } from 'next'
import { validateCaptcha } from '@server/captcha'
import {
  invalidParameter,
  missingParameter,
  useErrorMiddleware,
} from '@server/error-middleware'
import kratos from '@server/kratos'
import { VerifyDto } from '@server/models'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST':
      await useErrorMiddleware(req, res, async () => {
        const dto = req.body as VerifyDto
        if (!dto.captcha) {
          throw missingParameter('captcha')
        }

        const captcha = await validateCaptcha(dto.captcha)
        if (!captcha) {
          throw invalidParameter('captcha')
        }

        const cookie = req.headers.cookie
        try {
          const kratosRes = await kratos.submitSelfServiceVerificationFlow(
            dto.flow,
            {
              csrf_token: dto.csrfToken,
              method: 'link',
              email: dto.email,
            },
            dto.token,
            cookie,
          )

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
