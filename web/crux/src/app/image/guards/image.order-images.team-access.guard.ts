import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { OrderVersionImagesRequest } from 'src/grpc/protobuf/proto/crux'
import { getIdentity } from 'src/interceptors/grpc.user.interceptor'
import { Metadata } from '@grpc/grpc-js'

@Injectable()
export default class ImageOrderImagesTeamAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.getArgByIndex<OrderVersionImagesRequest>(0)
    const identity = getIdentity(context.getArgByIndex<Metadata>(1))

    // check the sent imageIds and versionId against the user's team
    const images = await this.prisma.image.count({
      where: {
        id: {
          in: request.imageIds,
        },
        version: {
          id: request.versionId,
          product: {
            team: {
              users: {
                some: {
                  userId: identity.id,
                  active: true,
                },
              },
            },
          },
        },
      },
    })

    // when the selected images count doesn't match the number of images according to the request, then
    // the user missing access for some, or teams are mixed up
    return images === request.imageIds.length
  }
}
