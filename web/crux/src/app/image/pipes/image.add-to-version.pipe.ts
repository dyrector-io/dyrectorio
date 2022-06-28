import { Injectable, PipeTransform } from '@nestjs/common'
import { PrismaService } from 'src/config/prisma.service'
import { checkVersionMutability } from 'src/domain/version'
import { AddImagesToVersionRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export class ImageAddToVersionValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  // TODO validate unique container names
  async transform(value: AddImagesToVersionRequest) {
    const version = await this.prisma.version.findUnique({
      select: {
        type: true,
        deployments: {
          distinct: ['status'],
        },
      },
      where: {
        id: value.versionId,
      },
    })

    checkVersionMutability(version)

    return value
  }
}
