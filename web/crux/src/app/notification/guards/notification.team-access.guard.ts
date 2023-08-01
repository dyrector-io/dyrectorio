import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class NotificationTeamAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamSlug = req.params.teamSlug as string
    const notificationId = req.params.notificationId as string

    if (!notificationId) {
      return true
    }

    const notifications = await this.prisma.notification.count({
      where: {
        id: notificationId,
        team: {
          slug: teamSlug,
        },
      },
    })

    return notifications > 0
  }
}
