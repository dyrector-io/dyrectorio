import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { checkDeploymentMutability } from 'src/domain/deployment'
import { UpdateDeploymentRequest } from 'src/grpc/protobuf/proto/crux'
import { PreconditionFailedException } from 'src/exception/errors'
import BodyPipeTransform from 'src/pipes/body.pipe'

@Injectable()
export default class DeployUpdateValidationPipe extends BodyPipeTransform<UpdateDeploymentRequest> {
  constructor(private prisma: PrismaService) {
    super()
  }

  async transformBody(value: UpdateDeploymentRequest) {
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
