import { Injectable, PipeTransform } from '@nestjs/common'
import { PrismaService } from 'src/config/prisma.service'
import { checkDeploymentMutability } from 'src/domain/deployment'
import { IdRequest } from 'src/proto/proto/crux'
import { deploymentSchema, yupValidate } from 'src/shared/validation'

@Injectable()
export class DeployStartValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: IdRequest) {
    const deployment = await this.prisma.deployment.findUnique({
      include: {
        instances: {
          include: {
            config: true,
            image: {
              include: {
                config: true,
              },
            },
          },
        },
      },
      where: {
        id: value.id,
      },
    })

    checkDeploymentMutability(deployment)

    yupValidate(deploymentSchema, deployment)

    return value
  }
}
