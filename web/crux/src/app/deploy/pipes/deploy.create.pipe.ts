import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { AlreadyExistsException, PreconditionFailedException } from 'src/exception/errors'
import { CreateDeploymentRequest } from 'src/grpc/protobuf/proto/crux'
import BodyPipeTransform from 'src/pipes/body.pipe'

@Injectable()
export default class DeployCreateValidationPipe extends BodyPipeTransform<CreateDeploymentRequest> {
  constructor(private prisma: PrismaService) {
    super()
  }

  async transformBody(value: CreateDeploymentRequest) {
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
