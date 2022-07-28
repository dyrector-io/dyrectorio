import { ProductTypeEnum } from '.prisma/client'
import { Injectable, PipeTransform } from '@nestjs/common'
import { PrismaService } from 'src/services/prisma.service'
import { checkVersionMutability } from 'src/domain/version'
import { PreconditionFailedException } from 'src/exception/errors'
import { UpdateVersionRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export class VersionUpdateValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: UpdateVersionRequest) {
    const version = await this.prisma.version.findUnique({
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
