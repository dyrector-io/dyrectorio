import { Injectable, PipeTransform } from '@nestjs/common'
import { PrismaService } from 'src/config/prisma.service'
import { checkDeploymentMutability } from 'src/domain/deployment'
import { PatchDeploymentRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export class DeployPatchValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: PatchDeploymentRequest) {
    const deployment = await this.prisma.deployment.findUnique({
      where: {
        id: value.id,
      },
    })

    checkDeploymentMutability(deployment)

    return PatchDeploymentRequest.fromJSON(value)
  }
}
