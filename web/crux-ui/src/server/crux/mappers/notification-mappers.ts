import { internalError } from '@app/error-responses'
import { NotificationEventType, NotificationType } from '@app/models'
import {
  NotificationEventType as ProtoNotificationEventType,
  NotificationType as ProtoNotificationType,
  notificationTypeFromJSON,
  notificationTypeToJSON,
} from '@app/models/grpc/protobuf/proto/crux'

export const notificationTypeToGrpc = (type: NotificationType): ProtoNotificationType =>
  notificationTypeFromJSON(type.toUpperCase())

export const notificationTypeToDto = (type: ProtoNotificationType): NotificationType =>
  notificationTypeToJSON(type).toLocaleLowerCase() as NotificationType

export const notificationEventTypeToGrpc = (type: NotificationEventType): ProtoNotificationEventType => {
  switch (type) {
    case 'deployment-created':
      return ProtoNotificationEventType.DEPLOYMENT_CREATED
    case 'version-created':
      return ProtoNotificationEventType.VERSION_CREATED
    case 'node-added':
      return ProtoNotificationEventType.NODE_ADDED
    case 'user-invited':
      return ProtoNotificationEventType.USER_INVITED
    default:
      return ProtoNotificationEventType.NOTIFICATION_EVENT_TYPE_UNSPECIFIED
  }
}

export const notificationEventTypeToDto = (type: ProtoNotificationEventType): NotificationEventType => {
  switch (type) {
    case ProtoNotificationEventType.DEPLOYMENT_CREATED:
      return 'deployment-created'
    case ProtoNotificationEventType.VERSION_CREATED:
      return 'version-created'
    case ProtoNotificationEventType.NODE_ADDED:
      return 'node-added'
    case ProtoNotificationEventType.USER_INVITED:
      return 'user-invited'
    case ProtoNotificationEventType.NOTIFICATION_EVENT_TYPE_UNSPECIFIED:
    default:
      throw internalError(`Unknown ProtoNotificationEventType '${type}'`)
  }
}
