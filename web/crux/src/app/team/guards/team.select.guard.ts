import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import { getIdentity } from 'src/interceptors/grpc.user.interceptor'
import { Metadata } from '@grpc/grpc-js'

@Injectable()
export default class TeamSelectGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.getArgByIndex<IdRequest>(0)
    const identity = getIdentity(context.getArgByIndex<Metadata>(1))

    const team = await this.prisma.usersOnTeams.findUnique({
      where: {
        userId_teamId: {
          userId: identity.id,
          teamId: request.id,
        },
      },
    })

    return !!team
  }
}
