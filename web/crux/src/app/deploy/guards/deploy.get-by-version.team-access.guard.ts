import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import { getAccessedBy } from 'src/interceptors/grpc.user.interceptor'
import { Metadata } from '@grpc/grpc-js'

@Injectable()
export default class DeployGetByVersionTeamAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.getArgByIndex<IdRequest>(0)
    const accessedBy = getAccessedBy(context.getArgByIndex<Metadata>(1))

    const version = await this.prisma.version.count({
      where: {
        id: request.id,
        product: {
          team: {
            users: {
              some: {
                userId: accessedBy,
                active: true,
              },
            },
          },
        },
      },
    })

    return version > 0
  }
}
