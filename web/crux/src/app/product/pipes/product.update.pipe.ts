import { Injectable, PipeTransform, PreconditionFailedException } from '@nestjs/common'
import { TeamRepository } from 'src/app/team/team.repository'
import { PrismaService } from 'src/services/prisma.service'
import { UpdateProductRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export class ProductUpdateValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService, private teamRepository: TeamRepository) {}

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
