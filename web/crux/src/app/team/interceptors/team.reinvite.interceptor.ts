import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { Observable } from 'rxjs'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'

@Injectable()
export default class TeamReinviteUserValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()

    const teamId = req.params.teamId as string
    const userId = req.params.userId as string

    const invite = await this.prisma.userInvitation.findUniqueOrThrow({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    })

    if (invite.status === 'declined') {
      throw new CruxPreconditionFailedException({
        message: 'Can not resend the invitation e-mail. The invitation was declined.',
        property: 'userId',
        value: userId,
      })
    }

    return next.handle()
  }
}
