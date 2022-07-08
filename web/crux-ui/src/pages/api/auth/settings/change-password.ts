import { ChangePassword } from '@app/models'
import kratos, { cookieOf } from '@server/kratos'
import { useKratosErrorMiddleware } from '@server/kratos-error-middleware'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as ChangePassword
  const cookie = cookieOf(req)

  const kratosRes = await kratos.submitSelfServiceSettingsFlow(
    dto.flow,
    {
      method: 'password',
      csrf_token: dto.csrfToken,
      password: dto.password,
    },
    undefined,
    cookie,
  )

  res.status(kratosRes.status).end()
}

export default withMiddlewares(
  {
    onPost,
  },
  [useKratosErrorMiddleware],
)
