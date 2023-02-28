import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { checkVersionMutability } from 'src/domain/version'
import { PreconditionFailedException } from 'src/exception/errors'
import { UpdateVersionRequest } from 'src/grpc/protobuf/proto/crux'
import { ProductTypeEnum } from '.prisma/client'
import BodyPipeTransform from 'src/pipes/body.pipe'

@Injectable()
export default class VersionUpdateValidationPipe extends BodyPipeTransform<UpdateVersionRequest> {
  constructor(private prisma: PrismaService) {
    super()
  }

  async transformBody(value: UpdateVersionRequest) {
    const version = await this.prisma.version.findUniqueOrThrow({
      include: {
        product: {
          select: {
            id: true,
            type: true,
          },
        },
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

    if (version.product.type === ProductTypeEnum.simple) {
      throw new PreconditionFailedException({
        message: 'Can not update version of a simple product.',
        property: 'id',
        value: value.name,
      })
    }

    return UpdateVersionRequest.fromJSON(value) // it's necessary, because ts-proto sends false booleans as undefined
  }
}
