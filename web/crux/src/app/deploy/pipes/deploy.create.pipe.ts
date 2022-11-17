import { Injectable, PipeTransform } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { AlreadyExistsException, PreconditionFailedException } from 'src/exception/errors'
import { CreateDeploymentRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export default class DeployCreateValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: CreateDeploymentRequest) {
    const deployments = await this.prisma.deployment.findMany({
      where: {
        nodeId: value.nodeId,
        versionId: value.versionId,
        prefix: value.prefix,
        status: 'preparing',
      },
    })

    if (deployments.length > 0) {
      throw new AlreadyExistsException({
        message: 'There is already a deployment with preparing status for the version on that node',
        property: 'deploymentId',
        value: deployments[0].id,
      })
    }

    const images = await this.prisma.image.count({
      where: {
        versionId: value.versionId,
      },
    })

    if (images < 1) {
      throw new PreconditionFailedException({
        message: 'There is no image to deploy',
        property: 'versionId',
        value: value.versionId,
      })
    }

    return value
  }
}
