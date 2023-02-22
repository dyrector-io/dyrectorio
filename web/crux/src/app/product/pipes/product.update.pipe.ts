import { Injectable, PreconditionFailedException } from '@nestjs/common'
import BodyPipeTransform from 'src/decorators/grpc.pipe'
import { UpdateProductRequest } from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class ProductUpdateValidationPipe extends BodyPipeTransform<UpdateProductRequest> {
  constructor(private prisma: PrismaService) {
    super()
  }

  async transformBody(value: UpdateProductRequest) {
    const product = await this.prisma.product.findUniqueOrThrow({
      where: {
        id: value.id,
      },
    })

    if (value.changelog && product.type !== 'simple') {
      throw new PreconditionFailedException({
        message: 'Only simple products can update their changelog.',
        property: 'changelog',
      })
    }

    return value
  }
}
