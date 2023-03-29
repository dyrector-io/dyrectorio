import { CallHandler, ConflictException, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import { InviteUserDto } from '../team.dto'

@Injectable()
export default class TeamInviteUserValitationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService, private kratos: KratosService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()

    const teamId = req.params.teamId as string
    const body = req.body as InviteUserDto

    const user = await this.kratos.getIdentityByEmail(body.email)
    if (!user) {
      return next.handle()
    }

    const userOnTeam = await this.prisma.usersOnTeams.findFirst({
      where: {
        userId: user.id,
        teamId,
      },
    })

    if (userOnTeam) {
      throw new ConflictException({
        message: 'User is already in the team',
        property: 'email',
      })
    }

    return next.handle()
  }
}
