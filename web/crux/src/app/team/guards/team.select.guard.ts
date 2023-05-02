import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { identityOfRequest } from 'src/app/token/jwt-auth.guard'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class TeamSelectGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamId = req.params.teamId as string

    const identity = identityOfRequest(context)

    const team = await this.prisma.usersOnTeams.findUnique({
      where: {
        userId_teamId: {
          userId: identity.id,
          teamId,
        },
      },
    })

    return !!team
  }
}
