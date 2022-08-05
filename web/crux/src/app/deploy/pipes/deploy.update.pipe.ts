import { Injectable, PipeTransform } from '@nestjs/common'
import { PrismaService } from 'src/services/prisma.service'
import { checkDeploymentMutability } from 'src/domain/deployment'
import { UpdateDeploymentRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export class DeployUpdateValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: UpdateDeploymentRequest) {
    const deployment = await this.prisma.deployment.findUnique({
      where: {
        id: value.id,
      },
    })

    checkDeploymentMutability(deployment)

    return value
  }
}
