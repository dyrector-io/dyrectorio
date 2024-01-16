import { Injectable } from '@nestjs/common'
import { Notification, NotificationEvent, NotificationEventTypeEnum } from '@prisma/client'
import { CruxBadRequestException } from 'src/exception/crux-exception'
import { NotificationDetailsDto, NotificationDto, NotificationEventTypeDto } from './notification.dto'

@Injectable()
export default class NotificationMapper {
  toDto(notification: Notification): NotificationDto {
    return {
      id: notification.id,
      name: notification.name,
      url: notification.url,
      type: notification.type,
      active: notification.active,
    }
  }

  detailsToDto(notification: NotificationWithEvents): NotificationDetailsDto {
    return {
      ...this.toDto(notification),
      enabledEvents: notification.events.map(ev => this.eventTypeToDto(ev.event)),
    }
  }

  eventTypeToDto(type: NotificationEventTypeEnum): NotificationEventTypeDto {
    switch (type) {
      case NotificationEventTypeEnum.deploymentStatus:
        return 'deployment-status'
      case NotificationEventTypeEnum.versionCreated:
        return 'version-created'
      case NotificationEventTypeEnum.nodeAdded:
        return 'node-added'
      case NotificationEventTypeEnum.userInvited:
        return 'user-invited'
      case NotificationEventTypeEnum.imagePushed:
        return 'image-pushed'
      case NotificationEventTypeEnum.imagePulled:
        return 'image-pulled'
      default:
        throw new CruxBadRequestException({
          message: `Unknown NotificationEventType '${type}'`,
        })
    }
  }

  eventTypeToDb(type: NotificationEventTypeDto): NotificationEventTypeEnum {
    switch (type) {
      case 'deployment-status':
        return NotificationEventTypeEnum.deploymentStatus
      case 'version-created':
        return NotificationEventTypeEnum.versionCreated
      case 'node-added':
        return NotificationEventTypeEnum.nodeAdded
      case 'user-invited':
        return NotificationEventTypeEnum.userInvited
      case 'image-pushed':
        return NotificationEventTypeEnum.imagePushed
      case 'image-pulled':
        return NotificationEventTypeEnum.imagePulled
      default:
        throw new CruxBadRequestException({
          property: 'notificationType',
          value: type,
          message: `Unknown NotificationEventType '${type}'`,
        })
    }
  }
}

export type NotificationWithEvents = Notification & {
  events: NotificationEvent[]
}
