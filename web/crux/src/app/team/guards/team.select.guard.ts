import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'
import { IdentityAwareServerSurfaceCall } from 'src/shared/user-access.guard'

@Injectable()
export default class TeamSelectGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.getArgByIndex<IdRequest>(0)
    const identity = context.getArgByIndex<IdentityAwareServerSurfaceCall>(2).user

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
