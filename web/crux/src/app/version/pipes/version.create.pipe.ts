import { ProductTypeEnum } from '.prisma/client'
import { Injectable, PipeTransform } from '@nestjs/common'
import { PrismaService } from 'src/config/prisma.service'
import { PreconditionFailedException } from 'src/exception/errors'
import { CreateVersionRequest } from 'src/proto/proto/crux'

@Injectable()
export class VersionCreateValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: CreateVersionRequest) {
    const product = await this.prisma.product.findUnique({
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
