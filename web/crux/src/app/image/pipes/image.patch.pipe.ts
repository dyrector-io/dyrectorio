import { Injectable, PipeTransform } from '@nestjs/common'
import { PrismaService } from 'src/services/prisma.service'
import { checkVersionMutability } from 'src/domain/version'
import { PatchImageRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export class ImagePatchValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: PatchImageRequest) {
    const image = await this.prisma.image.findUnique({
      include: {
        version: {
          include: {
            deployments: {
              distinct: ['status'],
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
