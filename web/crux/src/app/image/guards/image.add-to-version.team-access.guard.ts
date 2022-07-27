import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/services/prisma.service'
import { AddImagesToVersionRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export class ImageAddToVersionTeamAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.getArgByIndex<AddImagesToVersionRequest>(0)

    const registries = await this.prisma.registry.count({
      where: {
        id: {
          in: request.images.map(it => it.registryId),
        },
        team: {
          users: {
            some: {
              userId: request.accessedBy,
              active: true,
            },
          },
          products: {
            some: {
              versions: {
                some: {
                  id: request.versionId,
                },
              },
            },
          },
        },
      },
    })

    return registries === request.images.length
  }
}
