import { DyoServiceStatus } from '@app/models'
import { useErrorMiddleware } from '@server/error-middleware'
import { withMiddlewares } from '@server/middlewares'
import dyoServiceStatus from '@server/service-status'
import { NextApiRequest, NextApiResponse } from 'next'

const onGet = async (_: NextApiRequest, res: NextApiResponse) => {
  const dto: DyoServiceStatus = {
    crux: await dyoServiceStatus.crux.status(),
    kratos: await dyoServiceStatus.kratos.status(),
  }

  res.status(200).json(dto)
}

export default withMiddlewares(
  {
    onGet,
  },
  [useErrorMiddleware],
  false,
)
