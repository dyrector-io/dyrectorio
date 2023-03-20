import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { checkVersionMutability } from 'src/domain/version'
import { AddImagesToVersionRequest } from 'src/grpc/protobuf/proto/crux'
import BodyPipeTransform from 'src/pipes/body.pipe'

@Injectable()
export default class ImageAddToVersionValidationPipe extends BodyPipeTransform<AddImagesToVersionRequest> {
  constructor(private prisma: PrismaService) {
    super()
  }

  // TODO validate unique container names
  async transformBody(value: AddImagesToVersionRequest) {
    const version = await this.prisma.version.findUniqueOrThrow({
      select: {
        id: true,
        type: true,
        deployments: {
          distinct: ['status'],
        },
        children: {
          select: {
            versionId: true,
          },
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
