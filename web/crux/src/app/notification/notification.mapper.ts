import { BadRequestException, Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { Notification, NotificationEvent, NotificationEventTypeEnum } from '@prisma/client'
import { nameOrEmailOfIdentity } from 'src/shared/models'
import { NotificationDetailsDto, NotificationDto, NotificationEventTypeDto } from './notification.dto'

@Injectable()
export default class NotificationMapper {
  listToDto(notification: Notification, createdByIdentity: Identity): NotificationDto {
    return {
      id: notification.id,
      name: notification.name,
      url: notification.url,
      type: notification.type,
      active: notification.active,
      creator: nameOrEmailOfIdentity(createdByIdentity),
    }
  }

  detailsToDto(notification: NotificationWithEvents, createdByIdentity: Identity): NotificationDetailsDto {
    return {
      ...this.listToDto(notification, createdByIdentity),
      events: notification.events.map(ev => this.eventTypeToDto(ev.event)),
    }
  }

  eventTypeToDto(type: NotificationEventTypeEnum): NotificationEventTypeDto {
    switch (type) {
      case NotificationEventTypeEnum.deploymentCreated:
        return 'deployment-created'
      case NotificationEventTypeEnum.versionCreated:
        return 'version-created'
      case NotificationEventTypeEnum.nodeAdded:
        return 'node-added'
      case NotificationEventTypeEnum.userInvited:
        return 'user-invited'
      default:
        throw new BadRequestException({
          message: `Unknown NotificationEventType '${type}'`,
        })
    }
  }

  eventTypeToDb(type: NotificationEventTypeDto): NotificationEventTypeEnum {
    switch (type) {
      case 'deployment-created':
        return NotificationEventTypeEnum.deploymentCreated
      case 'version-created':
        return NotificationEventTypeEnum.versionCreated
      case 'node-added':
        return NotificationEventTypeEnum.nodeAdded
      case 'user-invited':
        return NotificationEventTypeEnum.userInvited
      default:
        throw new BadRequestException({
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
