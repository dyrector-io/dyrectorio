import { ChangePassword, UpdateSettingsWithPassword } from '@app/models'
import { cookieOf } from '@server/cookie'
import kratos, { identityRecoverySuccess, sessionOf } from '@server/kratos'
import useKratosErrorMiddleware from '@server/kratos-error-middleware'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as ChangePassword
  const cookie = cookieOf(req)

  const body: UpdateSettingsWithPassword = {
    method: 'password',
    csrf_token: dto.csrfToken,
    password: dto.password,
  }

  const kratosRes = await kratos.updateSettingsFlow({
    flow: dto.flow,
    cookie,
    updateSettingsFlowBody: body,
  })

  if (kratosRes.status === 200) {
    const session = sessionOf(req)
    await identityRecoverySuccess(session)
  }

  res.status(kratosRes.status).json(kratosRes.data)
}

export default withMiddlewares(
  {
    onPost,
  },
  [useKratosErrorMiddleware],
)
