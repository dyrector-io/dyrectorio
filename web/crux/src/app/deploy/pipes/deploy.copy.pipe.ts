import { Injectable, PipeTransform } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import { PreconditionFailedException } from 'src/exception/errors'
import { checkDeploymentCopiability } from 'src/domain/deployment'

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
        status: true,
        prefix: true,
        version: {
          select: {
            type: true,
          },
        },
      },
    })

    if (!checkDeploymentCopiability(deployment.status, deployment.version.type)) {
      throw new PreconditionFailedException({
        message: 'Invalid deployment status.',
        property: 'status',
        value: deployment.status,
      })
    }

    const preparingDeployment = await this.prisma.deployment.findFirst({
      where: {
        nodeId: deployment.nodeId,
        versionId: deployment.versionId,
        prefix: deployment.prefix,
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
