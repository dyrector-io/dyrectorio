import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { UpdateStorageRequest } from 'src/grpc/protobuf/proto/crux'
import { PreconditionFailedException } from 'src/exception/errors'
import BodyPipeTransform from 'src/pipes/body.pipe'
import { Storage } from '@prisma/client'
import StorageMapper from '../storage.mapper'

type Blacklist = Array<keyof Storage>
const blacklistedFields: Blacklist = ['name', 'url', 'accessKey', 'secretKey']

@Injectable()
export default class UpdateStorageValidationPipe extends BodyPipeTransform<UpdateStorageRequest> {
  constructor(private prisma: PrismaService, private mapper: StorageMapper) {
    super()
  }

  async transformBody(req: UpdateStorageRequest) {
    const usedContainerConfig = await this.prisma.containerConfig.count({
      where: {
        storageId: req.id,
      },
      take: 1,
    })
    const usedInstanceContainerConfig = await this.prisma.instanceContainerConfig.count({
      where: {
        storageId: req.id,
      },
      take: 1,
    })

    if (usedContainerConfig === 0 && usedInstanceContainerConfig === 0) {
      return req
    }

    const storage = await this.prisma.storage.findUniqueOrThrow({
      where: {
        id: req.id,
      },
    })

    blacklistedFields.forEach(it => {
      if (req[it] !== storage[it]) {
        throw new PreconditionFailedException({
          property: 'id',
          value: req.id,
          message: 'Storage is already in use.',
        })
      }
    })

    return req
  }
}
