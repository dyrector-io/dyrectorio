import { nameOrEmailOfIdentity } from '@dyrectorio/common'
import { Injectable } from '@nestjs/common'
import { NotificationTypeEnum, Notification } from '@prisma/client'
import {
  AuditResponse,
  NotificationResponse,
  NotificationType,
  notificationTypeFromJSON,
  notificationTypeToJSON,
  CreateNotificationResponse,
  NotificationDetailsResponse,
} from 'src/grpc/protobuf/proto/crux'
import { Identity } from '@ory/kratos-client'

@Injectable()
export class NotificationMapper {
  toGrpc(notification: Notification): NotificationResponse {
    return {
      ...notification,
      type: this.typeToGrpc(notification.type),
      audit: AuditResponse.fromJSON(notification),
    }
  }

  detailsToGrpc(notification: Notification, identity: Identity): NotificationDetailsResponse {
    return {
      ...notification,
      type: this.typeToGrpc(notification.type),
      audit: {
        ...AuditResponse.fromJSON(notification),
        createdBy: nameOrEmailOfIdentity(identity),
      },
    }
  }

  toGrpcListResponse(notifications: Notification[], identities: Map<string, Identity>): NotificationResponse[] {
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
}
