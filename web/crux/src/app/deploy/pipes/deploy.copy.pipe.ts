import { Injectable, PipeTransform } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import { PreconditionFailedException } from 'src/exception/errors'

@Injectable()
export default class DeployCopyValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: IdRequest) {
    const deployment = await this.prisma.deployment.findFirstOrThrow({
      where: {
        id: value.id,
      },
      select: {
        nodeId: true,
        versionId: true,
      },
    })

    const preparingDeployment = await this.prisma.deployment.findFirst({
      where: {
        nodeId: deployment.nodeId,
        versionId: deployment.versionId,
        status: 'preparing',
      },
      select: {
        id: true,
      },
    })

    if (preparingDeployment) {
      throw new PreconditionFailedException({
        message: 'The node already has a preparing deployment.',
        property: 'id',
        value: preparingDeployment.id,
      })
    }

    return value
  }
}
