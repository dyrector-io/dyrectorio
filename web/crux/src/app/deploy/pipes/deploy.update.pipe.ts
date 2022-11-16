import { Injectable, PipeTransform } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { checkDeploymentMutability } from 'src/domain/deployment'
import { UpdateDeploymentRequest } from 'src/grpc/protobuf/proto/crux'
import { PreconditionFailedException } from 'src/exception/errors'

@Injectable()
export default class DeployUpdateValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: UpdateDeploymentRequest) {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id: value.id,
      },
      include: {
        version: true,
      },
    })

    if (!checkDeploymentMutability(deployment.status, deployment.version.type)) {
      throw new PreconditionFailedException({
        message: 'Invalid deployment status.',
        property: 'status',
        value: deployment.status,
      })
    }

    return value
  }
}
