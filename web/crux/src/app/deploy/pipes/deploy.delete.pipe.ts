import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { checkDeploymentDeletability } from 'src/domain/deployment'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import { PreconditionFailedException } from 'src/exception/errors'
import BodyPipeTransform from 'src/decorators/grpc.pipe'

@Injectable()
export default class DeleteDeploymentValidationPipe extends BodyPipeTransform<IdRequest> {
  constructor(private prisma: PrismaService) {
    super()
  }

  async transformBody(value: IdRequest) {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id: value.id,
      },
    })

    if (!checkDeploymentDeletability(deployment.status)) {
      throw new PreconditionFailedException({
        message: 'Invalid deployment status.',
        property: 'status',
        value: deployment.status,
      })
    }

    return value
  }
}
