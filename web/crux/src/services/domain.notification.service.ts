import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { NotificationEventTypeEnum, NotificationTypeEnum } from '@prisma/client'
import { lastValueFrom } from 'rxjs'
import NotificationTemplateBuilder from 'src/builders/notification.template.builder'
import { nameOrEmailOfIdentity } from 'src/domain/identity'
import {
  NotificationMessageType,
  NotificationTemplate,
  RegistryImageMessage,
  getTemplate,
} from 'src/domain/notification-templates'
import { REGISTRY_EVENT_V2_PULL, REGISTRY_EVENT_V2_PUSH, RegistryV2Event } from 'src/domain/registry'
import { CruxInternalServerErrorException } from 'src/exception/crux-exception'
import PrismaService from './prisma.service'

@Injectable()
export default class DomainNotificationService {
  private readonly logger = new Logger(DomainNotificationService.name)

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private templateBuilder: NotificationTemplateBuilder,
  ) {}

  async sendNotification(template: NotificationTemplate): Promise<void> {
    const eventType = this.getMessageEventFromType(template.messageType)

    const notifications = await this.prisma.notification.findMany({
      include: {
        events: {
          select: {
            event: true,
          },
        },
      },
      where: {
        teamId: template.teamId,
        active: true,
        events: {
          some: {
            event: eventType,
          },
        },
      },
    })

    if (notifications.length > 0) {
      await Promise.all(notifications.map(it => this.send(it.url, it.type, template)))
    }
  }

  @OnEvent(REGISTRY_EVENT_V2_PUSH, { async: true })
  async onRegistryV2Push(event: RegistryV2Event): Promise<void> {
    await this.sendRegistryV2EventNotification('image-pushed', event)
  }

  @OnEvent(REGISTRY_EVENT_V2_PULL, { async: true })
  async onRegistryV2Pull(event: RegistryV2Event): Promise<void> {
    await this.sendRegistryV2EventNotification('image-pulled', event)
  }

  private async sendRegistryV2EventNotification(type: NotificationMessageType, event: RegistryV2Event) {
    const { registry } = event

    await this.sendNotification({
      teamId: registry.teamId,
      messageType: type,
      message: {
        registry: registry.name,
        image: `${event.imageName}:${event.imageTag}`,
      } as RegistryImageMessage,
    })
  }

  private async send(url: string, type: NotificationTypeEnum, temp: NotificationTemplate): Promise<void> {
    const msg = temp.message
    if (!msg.owner) {
      msg.owner = 'Unknown'
    } else if (typeof msg.owner !== 'string') {
      msg.owner = nameOrEmailOfIdentity(msg.owner)
    }

    try {
      const template = this.templateBuilder.processTemplate('notificationTemplates', temp.messageType, temp.message)

      const chatTemplate = getTemplate(type, template.message)

      if (chatTemplate) {
        await lastValueFrom(this.httpService.post(url, chatTemplate))
      }
    } catch (err) {
      this.logger.error(err)
    }
  }

  private getMessageEventFromType(messageType: NotificationMessageType): NotificationEventTypeEnum {
    switch (messageType) {
      case 'node':
        return NotificationEventTypeEnum.nodeAdded
      case 'version':
        return NotificationEventTypeEnum.versionCreated
      case 'invite':
        return NotificationEventTypeEnum.userInvited
      case 'image-pulled':
        return NotificationEventTypeEnum.imagePulled
      case 'image-pushed':
        return NotificationEventTypeEnum.imagePushed
      case 'deploy-failed':
      case 'deploy-successful':
        return NotificationEventTypeEnum.deploymentStatus
      default:
        throw new CruxInternalServerErrorException({
          property: 'messageType',
          value: messageType,
          message: `Unknown NotificationMessageType '${messageType}'`,
        })
    }
  }
}
