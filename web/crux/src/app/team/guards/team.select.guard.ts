import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export default class TeamSelectGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.getArgByIndex<IdRequest>(0)

    const team = await this.prisma.usersOnTeams.findUnique({
      where: {
        userId_teamId: {
          userId: request.accessedBy,
          teamId: request.id,
        },
      },
    })

    return !!team
  }
}
