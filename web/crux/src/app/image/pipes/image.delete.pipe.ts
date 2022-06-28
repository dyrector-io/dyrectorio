import { Injectable, PipeTransform } from '@nestjs/common'
import { PrismaService } from 'src/config/prisma.service'
import { checkVersionMutability } from 'src/domain/version'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export class DeleteImageValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: IdRequest) {
    const image = await this.prisma.image.findUnique({
      select: {
        version: {
          select: {
            type: true,
            deployments: {
              distinct: ['status'],
            },
          },
        },
      },
      where: {
        id: value.id,
      },
    })

    checkVersionMutability(image.version)

    return value
  }
}
