import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import { PreconditionFailedException } from 'src/exception/errors'
import BodyPipeTransform from 'src/pipes/body.pipe'

@Injectable()
export default class DeleteRegistryValidationPipe extends BodyPipeTransform<IdRequest> {
  constructor(private prisma: PrismaService) {
    super()
  }

  async transformBody(value: IdRequest) {
    const used = await this.prisma.image.count({
      where: {
        registryId: value.id,
      },
      take: 1,
    })

    if (used > 0) {
      throw new PreconditionFailedException({
        property: 'id',
        value: value.id,
        message: 'Registry is already in use.',
      })
    }

    return value
  }
}
