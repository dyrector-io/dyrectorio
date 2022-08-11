import { Injectable, PipeTransform, PreconditionFailedException } from '@nestjs/common'
import { UpdateProductRequest } from 'src/grpc/protobuf/proto/crux'
import { PrismaService } from 'src/services/prisma.service'

@Injectable()
export class ProductUpdateValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: UpdateProductRequest) {
    const product = await this.prisma.product.findUnique({
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
