import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { checkVersionMutability } from 'src/domain/version'
import { PatchImageRequest } from 'src/grpc/protobuf/proto/crux'
import BodyPipeTransform from 'src/pipes/body.pipe'

@Injectable()
export default class ImagePatchValidationPipe extends BodyPipeTransform<PatchImageRequest> {
  constructor(private prisma: PrismaService) {
    super()
  }

  async transformBody(value: PatchImageRequest) {
    const image = await this.prisma.image.findUniqueOrThrow({
      include: {
        version: {
          include: {
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

    return PatchImageRequest.fromJSON(value) // it's necassary beacuse of user gets serialized as Long object
  }
}
