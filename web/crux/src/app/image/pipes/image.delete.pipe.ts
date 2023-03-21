import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { checkVersionMutability } from 'src/domain/version'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import BodyPipeTransform from 'src/pipes/body.pipe'

@Injectable()
export default class DeleteImageValidationPipe extends BodyPipeTransform<IdRequest> {
  constructor(private prisma: PrismaService) {
    super()
  }

  async transformBody(value: IdRequest) {
    const image = await this.prisma.image.findUniqueOrThrow({
      select: {
        version: {
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
        },
      },
      where: {
        id: value.id,
      },
    })

    checkVersionMutability(image.version)

    return value
  }
}
