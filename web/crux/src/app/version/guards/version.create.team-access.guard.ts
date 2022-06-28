import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/config/prisma.service'
import { CreateVersionRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export class VersionCreateTeamAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.getArgByIndex<CreateVersionRequest>(0)

    const products = await this.prisma.product.count({
      where: {
        id: request.productId,
        team: {
          users: {
            some: {
              userId: request.accessedBy,
              active: true,
            },
          },
        },
      },
    })

    return products > 0
  }
}
