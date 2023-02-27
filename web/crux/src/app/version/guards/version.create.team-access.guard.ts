import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { CreateVersionRequest } from 'src/grpc/protobuf/proto/crux'
import { getIdentity } from 'src/interceptors/grpc.user.interceptor'
import { Metadata } from '@grpc/grpc-js'

@Injectable()
export default class VersionCreateTeamAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.getArgByIndex<CreateVersionRequest>(0)
    const identity = getIdentity(context.getArgByIndex<Metadata>(1))

    const products = await this.prisma.product.count({
      where: {
        id: request.productId,
        team: {
          users: {
            some: {
              userId: identity.id,
              active: true,
            },
          },
        },
      },
    })

    return products > 0
  }
}
