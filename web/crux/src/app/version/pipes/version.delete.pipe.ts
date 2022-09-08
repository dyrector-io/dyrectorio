import { Injectable, PipeTransform } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { checkVersionMutability } from 'src/domain/version'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export default class VersionDeleteValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: IdRequest) {
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
