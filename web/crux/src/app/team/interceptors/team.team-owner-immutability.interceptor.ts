import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class TeamOwnerImmutabilityValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()

    const teamId = req.params.teamId as string
    const userId = req.params.userId as string

    const userOnTeam = await this.prisma.usersOnTeams.findUnique({
      where: {
        userId_teamId: {
          teamId,
          userId,
        },
      },
    })

    // the user is only invited
    if (!userOnTeam) {
      const invitation = await this.prisma.userInvitation.findUnique({
        where: {
          userId_teamId: {
            teamId,
            userId,
          },
        },
      })

      if (!invitation) {
        throw new NotFoundException({
          property: 'userId',
          message: 'Invitation not found',
        })
      }
    } else if (userOnTeam.role === 'owner') {
      throw new ForbiddenException({
        message: 'Can not modify the team owner',
      })
    }

    return next.handle()
  }
}
