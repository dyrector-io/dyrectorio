import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { PreconditionFailedException } from 'src/exception/errors'
import { CreateVersionRequest } from 'src/grpc/protobuf/proto/crux'
import { ProductTypeEnum } from '.prisma/client'
import BodyPipeTransform from 'src/pipes/body.pipe'

@Injectable()
export default class VersionCreateValidationPipe extends BodyPipeTransform<CreateVersionRequest> {
  constructor(private prisma: PrismaService) {
    super()
  }

  async transformBody(value: CreateVersionRequest) {
    const product = await this.prisma.product.findUniqueOrThrow({
      where: {
        id: value.productId,
      },
    })

    if (product.type === ProductTypeEnum.simple) {
      throw new PreconditionFailedException({
        message: 'Can not add version to a simple product.',
        property: 'productId',
        value: value.productId,
      })
    }

    return CreateVersionRequest.fromJSON(value) // it's necessary, because ts-proto sends false booleans as undefined
  }
}
