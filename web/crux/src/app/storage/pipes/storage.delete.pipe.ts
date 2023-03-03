import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import { PreconditionFailedException } from 'src/exception/errors'
import BodyPipeTransform from 'src/pipes/body.pipe'

@Injectable()
export default class DeleteStorageValidationPipe extends BodyPipeTransform<IdRequest> {
  constructor(private prisma: PrismaService) {
    super()
  }

  async transformBody(value: IdRequest) {
    const usedContainerConfig = await this.prisma.containerConfig.count({
      where: {
        storageId: value.id,
      },
      take: 1,
    })
    if (usedContainerConfig > 0) {
      throw new PreconditionFailedException({
        property: 'id',
        value: value.id,
        message: 'Storage is already in use.',
      })
    }

    const usedInstanceContainerConfig = await this.prisma.instanceContainerConfig.count({
      where: {
        storageId: value.id,
      },
      take: 1,
    })
    if (usedInstanceContainerConfig > 0) {
      throw new PreconditionFailedException({
        property: 'id',
        value: value.id,
        message: 'Storage is already in use.',
      })
    }

    return value
  }
}
