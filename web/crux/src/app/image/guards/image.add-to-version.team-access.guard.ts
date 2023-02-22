import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { AddImagesToVersionRequest } from 'src/grpc/protobuf/proto/crux'
import { getAccessedBy } from 'src/interceptors/grpc.user.interceptor'
import { Metadata } from '@grpc/grpc-js'

@Injectable()
export default class ImageAddToVersionTeamAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.getArgByIndex<AddImagesToVersionRequest>(0)
    const accessedBy = getAccessedBy(context.getArgByIndex<Metadata>(1))

    const registries = await this.prisma.registry.count({
      where: {
        id: {
          in: request.images.map(it => it.registryId),
        },
        team: {
          users: {
            some: {
              userId: accessedBy,
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
