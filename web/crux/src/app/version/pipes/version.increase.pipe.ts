import { ProductTypeEnum } from '.prisma/client'
import { Injectable, PipeTransform } from '@nestjs/common'
import { checkVersionMutability } from 'src/domain/version'
import { AlreadyExistsException, PreconditionFailedException } from 'src/exception/errors'
import { IncreaseVersionRequest } from 'src/grpc/protobuf/proto/crux'
import { PrismaService } from 'src/services/prisma.service'

@Injectable()
export class VersionIncreaseValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: IncreaseVersionRequest) {
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
        _count: {
          select: {
            children: true,
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
        message: 'Can not increase version of a simple product.',
        property: 'id',
        value: value.name,
      })
    }

    if (version._count.children > 0) {
      throw new AlreadyExistsException({
        message: 'This version already has a child version',
        property: 'id',
        value: value.id,
      })
    }

    return value
  }
}
