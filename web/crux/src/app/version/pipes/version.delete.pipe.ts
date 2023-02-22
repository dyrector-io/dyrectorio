import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { checkVersionMutability } from 'src/domain/version'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import BodyPipeTransform from 'src/decorators/grpc.pipe'

@Injectable()
export default class VersionDeleteValidationPipe extends BodyPipeTransform<IdRequest> {
  constructor(private prisma: PrismaService) {
    super()
  }

  async transformBody(value: IdRequest) {
    const version = await this.prisma.version.findUniqueOrThrow({
      include: {
        deployments: {
          select: {
            status: true,
          },
        },
      },
      where: {
        id: value.id,
      },
    })

    checkVersionMutability(version)

    return value
  }
}
