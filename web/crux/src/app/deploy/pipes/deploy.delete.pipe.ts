import { Injectable, PipeTransform } from '@nestjs/common'
import { PrismaService } from 'src/services/prisma.service'
import { checkDeploymentMutability } from 'src/domain/deployment'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export class DeleteDeploymentValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: IdRequest) {
    const deployment = await this.prisma.deployment.findUnique({
      where: {
        id: value.id,
      },
    })

    checkDeploymentMutability(deployment)

    return value
  }
}
