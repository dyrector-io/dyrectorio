import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { identityOfRequest } from 'src/app/token/jwt-auth.guard'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class NotificationTeamAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const notificationId = req.params.notificationId as string

    if (!notificationId) {
      return true
    }

    const identity = identityOfRequest(context)

    const notifications = await this.prisma.notification.count({
      where: {
        id: notificationId,
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

    return notifications > 0
  }
}
