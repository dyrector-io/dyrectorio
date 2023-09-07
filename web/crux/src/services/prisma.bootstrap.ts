import { INestApplication } from '@nestjs/common'
import { DeploymentStatusEnum } from '@prisma/client'
import RegistryMetrics from 'src/shared/metrics/registry.metrics'
import PrismaService from './prisma.service'

const prismaBootstrap = async (app: INestApplication) => {
  const prisma = await app.get(PrismaService)

  // Crux is starting so inProgress deployments should not exist
  // Find inProgress deployments and mark them as failed
  await prisma.deployment.updateMany({
    where: {
      status: DeploymentStatusEnum.inProgress,
    },
    data: {
      status: DeploymentStatusEnum.failed,
    },
  })

  // NOTE(@robot9706): Count number of registries by type and init metrics
  const counts = await prisma.registry.groupBy({
    by: ['type'],
    _count: {
      _all: true,
    },
  })

  // eslint-disable-next-line no-underscore-dangle
  counts.forEach(it => RegistryMetrics.count(it.type).set(it._count._all))
}

export default prismaBootstrap
