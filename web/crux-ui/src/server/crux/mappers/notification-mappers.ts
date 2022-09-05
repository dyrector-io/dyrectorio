import { NotificationType } from '@app/models'
import {
  NotificationType as ProtoNotificationType,
  notificationTypeFromJSON,
  notificationTypeToJSON,
} from '@app/models/grpc/protobuf/proto/crux'

export const notificationTypeToGrpc = (type: NotificationType): ProtoNotificationType =>
  notificationTypeFromJSON(type.toUpperCase())

export const notificationTypeToDto = (type: ProtoNotificationType): NotificationType =>
  notificationTypeToJSON(type).toLocaleLowerCase() as NotificationType
