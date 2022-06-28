import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/config/prisma.service'
import { AddImagesToVersionRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export class ImageAddToVersionTeamAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.getArgByIndex<AddImagesToVersionRequest>(0)

    const version = await this.prisma.version.count({
      where: {
        id: request.versionId,
        product: {
          team: {
            users: {
              some: {
                userId: request.accessedBy,
                active: true,
              },
            },
            registries: {
              some: {
                id: request.registryId,
              },
            },
          },
        },
      },
    })

    return version > 0
  }
}
