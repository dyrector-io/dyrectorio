import { DyoServiceInfo } from '@app/models'
import { useErrorMiddleware } from '@server/error-middleware'
import { withMiddlewares } from '@server/middlewares'
import packageInfo from '@server/package'
import dyoServiceStatus from '@server/service-status'
import { NextApiRequest, NextApiResponse } from 'next'

const onGet = async (_: NextApiRequest, res: NextApiResponse) => {
  const crux = await dyoServiceStatus.crux.info()
  const kratos = await dyoServiceStatus.kratos.info()

  const dto: DyoServiceInfo = {
    crux: crux,
    kratos: kratos,
    database: {
      status: crux.lastMigration ? 'operational' : 'unavailable',
      version: crux.lastMigration ? crux.lastMigration.split('_', 1)[0] : null,
    },
    app: {
      status: crux.status === 'operational' && kratos.status === 'operational' ? 'operational' : 'disrupted',
      version: packageInfo.version,
    },
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
