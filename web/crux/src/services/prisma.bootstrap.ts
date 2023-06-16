import { INestApplication } from '@nestjs/common'
import { DeploymentStatusEnum } from '@prisma/client'
import PrismaService from './prisma.service'

const prismaBootstrap = async (app: INestApplication) => {
  const prisma = await app.get(PrismaService)

  // Crux is starting so imProgress deployments should not exist
  // Find inProgress deployments and mark them as failed
  await prisma.deployment.updateMany({
    where: {
      status: DeploymentStatusEnum.inProgress,
    },
    data: {
      status: DeploymentStatusEnum.failed,
    },
  })
}

export default prismaBootstrap
