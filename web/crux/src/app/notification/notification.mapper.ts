import { nameOrEmailOfIdentity } from 'src/shared/model'
import { Injectable } from '@nestjs/common'
import { NotificationTypeEnum, Notification, NotificationEvent, NotificationEventTypeEnum } from '@prisma/client'
import {
  AuditResponse,
  NotificationResponse,
  NotificationType,
  notificationTypeFromJSON,
  notificationTypeToJSON,
  CreateNotificationResponse,
  NotificationDetailsResponse,
  NotificationEventType,
  notificationEventTypeFromJSON,
  notificationEventTypeToJSON,
} from 'src/grpc/protobuf/proto/crux'
import { Identity } from '@ory/kratos-client'
import { InternalException, InvalidArgumentException } from 'src/exception/errors'

@Injectable()
export class NotificationMapper {
  toGrpc(notification: NotificationWithEvents): NotificationResponse {
    return {
      ...notification,
      type: this.typeToGrpc(notification.type),
      audit: AuditResponse.fromJSON(notification),
      events: notification.events.map(ev => this.eventTypeToGrpc(ev.event)),
    }
  }

  detailsToGrpc(notification: NotificationWithEvents, identity: Identity): NotificationDetailsResponse {
    return {
      ...notification,
      type: this.typeToGrpc(notification.type),
      audit: {
        ...AuditResponse.fromJSON(notification),
        createdBy: nameOrEmailOfIdentity(identity),
      },
      events: notification.events.map(ev => this.eventTypeToGrpc(ev.event)),
    }
  }

  toGrpcListResponse(
    notifications: NotificationWithEvents[],
    identities: Map<string, Identity>,
  ): NotificationResponse[] {
    return notifications.map(it => {
      const identity = identities.get(it.createdBy)

      if (!identity) {
        return null
      }

      return {
        ...it,
        type: this.typeToGrpc(it.type),
        audit: {
          ...AuditResponse.fromJSON(it),
          createdBy: nameOrEmailOfIdentity(identity),
        },
        events: it.events.map(ev => this.eventTypeToGrpc(ev.event)),
      } as NotificationResponse
    })
  }

  toGrpcCreateResponse(notification: Notification, identity: Identity): CreateNotificationResponse {
    return {
      id: notification.id,
      creator: nameOrEmailOfIdentity(identity),
    }
  }

  typeToGrpc(type: NotificationTypeEnum): NotificationType {
    return notificationTypeFromJSON(type.toUpperCase())
  }

  typeToDb(type: NotificationType): NotificationTypeEnum {
    return notificationTypeToJSON(type).toLowerCase() as NotificationTypeEnum
  }

  eventTypeToGrpc(type: NotificationEventTypeEnum): NotificationEventType {
    switch (type) {
      case NotificationEventTypeEnum.deploymentCreated:
        return NotificationEventType.DEPLOYMENT_CREATED
      case NotificationEventTypeEnum.versionCreated:
        return NotificationEventType.VERSION_CREATED
      case NotificationEventTypeEnum.nodeAdded:
        return NotificationEventType.NODE_ADDED
      case NotificationEventTypeEnum.userInvited:
        return NotificationEventType.USER_INVITED
      default:
        throw new InternalException({
          message: `Unknown NotificationEventType '${type}'`,
        })
    }
  }

  eventTypeToDb(type: NotificationEventType): NotificationEventTypeEnum {
    switch (type) {
      case NotificationEventType.DEPLOYMENT_CREATED:
        return NotificationEventTypeEnum.deploymentCreated
      case NotificationEventType.VERSION_CREATED:
        return NotificationEventTypeEnum.versionCreated
      case NotificationEventType.NODE_ADDED:
        return NotificationEventTypeEnum.nodeAdded
      case NotificationEventType.USER_INVITED:
        return NotificationEventTypeEnum.userInvited
      default:
        throw new InvalidArgumentException({
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
