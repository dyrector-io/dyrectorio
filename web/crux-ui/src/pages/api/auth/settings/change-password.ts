import { ChangePassword } from '@app/models'
import kratos, { cookieOf, identityPasswordSet, sessionOf } from '@server/kratos'
import useKratosErrorMiddleware from '@server/kratos-error-middleware'
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

  if (kratosRes.status === 200) {
    const session = sessionOf(req)
    await identityPasswordSet(session)
  }

  res.status(kratosRes.status).json(kratosRes.data)
}

export default withMiddlewares(
  {
    onPost,
  },
  [useKratosErrorMiddleware],
)
