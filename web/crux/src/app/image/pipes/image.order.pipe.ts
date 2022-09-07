import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { checkVersionMutability } from 'src/domain/version'
import { AlreadyExistsException, InvalidArgumentException } from 'src/exception/errors'
import { OrderVersionImagesRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export default class OrderImagesValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: OrderVersionImagesRequest) {
    const version = await this.prisma.version.findUniqueOrThrow({
      include: {
        images: true,
        deployments: {
          distinct: ['status'],
        },
      },
      where: {
        id: value.versionId,
      },
    })

    checkVersionMutability(version)

    const { images } = version

    if (images.length !== value.imageIds.length) {
      throw new BadRequestException({
        message: 'Image count mismatch',
        property: 'imageIds',
      })
    }

    const idMismatch = images.filter(it => !value.imageIds.includes(it.id))
    if (idMismatch.length > 0) {
      throw new InvalidArgumentException({
        message: 'Missing image id(s)',
        property: 'imageIds',
        value: idMismatch.map(it => it.id),
      })
    }

    const imageIds = new Set(value.imageIds)
    if (imageIds.size !== value.imageIds.length) {
      throw new AlreadyExistsException({
        message: 'Duplicated image id(s)',
        property: 'imageIds',
      })
    }

    return value
  }
}
