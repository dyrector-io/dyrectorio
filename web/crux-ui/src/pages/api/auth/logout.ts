import { Logout } from '@app/models'
import kratos from '@server/kratos'
import useKratosErrorMiddleware from '@server/kratos-error-middleware'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const kratosRes = await kratos.createBrowserLogoutFlow({
    cookie: req.headers.cookie,
  })

  const dto: Logout = {
    url: kratosRes.data.logout_url,
  }

  res.status(200).json(dto)
}

export default withMiddlewares(
  {
    onPost,
  },
  [useKratosErrorMiddleware],
)
