import { nameOrEmailOfIdentity } from './../shared/model'
import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { NotificationTypeEnum } from '@prisma/client'
import { lastValueFrom } from 'rxjs'
import { getTemplate, NotificationTemplate } from 'src/domain/notification-templates'
import { KratosService } from './kratos.service'
import { PrismaService } from './prisma.service'

@Injectable()
export class DomainNotificationService {
  private readonly logger = new Logger(DomainNotificationService.name)

  constructor(private prisma: PrismaService, private httpService: HttpService, private kratos: KratosService) {}

  async sendNotification(template: NotificationTemplate): Promise<void> {
    const userOnTeam = await this.prisma.usersOnTeams.findFirst({
      where: {
        userId: template.identityId,
        active: true,
      },
    })

    const identity = await this.kratos.getIdentityById(template.identityId)
    template.message.owner = nameOrEmailOfIdentity(identity)

    if (userOnTeam) {
      const notifications = await this.prisma.notification.findMany({
        where: {
          teamId: userOnTeam.teamId,
          active: true,
        },
      })

      notifications.forEach(async notification => {
        await this.send(notification.url, notification.type, template)
      })
    }
  }

  private async send(url: string, type: NotificationTypeEnum, temp: NotificationTemplate): Promise<void> {
    try {
      const template = getTemplate(type, temp)

      if (template) {
        await lastValueFrom(this.httpService.post(url, template))
      }
    } catch (err) {
      this.logger.error(err)
    }
  }
}
