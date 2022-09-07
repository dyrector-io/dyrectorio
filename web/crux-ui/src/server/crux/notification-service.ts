import {
  CreateNotification,
  NotificationDetails,
  NotificationEventType,
  NotificationType,
  UpdateNotification,
} from '@app/models'
import {
  AccessRequest,
  CreateNotificationRequest,
  CreateNotificationResponse,
  CruxNotificationClient,
  Empty,
  IdRequest,
  NotificationDetailsResponse,
  NotificationEventType as ProtoNotificationEventType,
  NotificationListResponse,
  NotificationType as ProtoNotificationType,
  notificationTypeFromJSON,
  notificationTypeToJSON,
  UpdateEntityResponse,
  UpdateNotificationRequest,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { protomisify } from './grpc-connection'

class DyoNotifcationService {
  constructor(private client: CruxNotificationClient, private identity: Identity) {}

  async getAll(): Promise<NotificationDetails[]> {
    const req: AccessRequest = {
      accessedBy: this.identity.id,
    }

    const res = await protomisify<AccessRequest, NotificationListResponse>(
      this.client,
      this.client.getNotificationList,
    )(AccessRequest, req)

    return res.data.map(it => {
      return {
        ...it,
        type: notificationTypeToDto(it.type),
        creator: it.audit.createdBy,
        events: it.events.map(ev => notificationEventTypeToDto(ev)),
      }
    })
  }

  async create(dto: CreateNotification): Promise<NotificationDetails> {
    const req: CreateNotificationRequest = {
      ...dto,
      type: notificationTypeToGrpc(dto.type),
      accessedBy: this.identity.id,
      events: dto.events.map(ev => notificationEventTypeToGrpc(ev)),
    }

    const res = await protomisify<CreateNotificationRequest, CreateNotificationResponse>(
      this.client,
      this.client.createNotification,
    )(CreateNotificationRequest, req)

    return {
      ...dto,
      id: res.id,
      creator: res.creator,
    }
  }

  async update(dto: UpdateNotification): Promise<string> {
    const req: UpdateNotificationRequest = {
      ...dto,
      type: notificationTypeToGrpc(dto.type),
      accessedBy: this.identity.id,
      events: dto.events.map(ev => notificationEventTypeToGrpc(ev)),
    }

    const res = await protomisify<UpdateNotificationRequest, UpdateEntityResponse>(
      this.client,
      this.client.updateNotification,
    )(UpdateNotificationRequest, req)

    return timestampToUTC(res.updatedAt)
  }

  async getNotificationDetails(id: string): Promise<NotificationDetails> {
    const req: IdRequest = {
      id: id,
      accessedBy: this.identity.id,
    }

    const res = await protomisify<IdRequest, NotificationDetailsResponse>(
      this.client,
      this.client.getNotificationDetails,
    )(IdRequest, req)

    return {
      ...res,
      type: notificationTypeToDto(res.type),
      creator: res.audit.createdBy,
      events: res.events.map(ev => notificationEventTypeToDto(ev)),
    }
  }

  async delete(id: string) {
    const req: IdRequest = {
      id: id,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteNotification)(IdRequest, req)
  }

  async testNotification(id: string): Promise<void> {
    const req: IdRequest = {
      id: id,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.testNotification)(IdRequest, req)
  }
}

export default DyoNotifcationService

export const notificationTypeToGrpc = (type: NotificationType): ProtoNotificationType => {
  return notificationTypeFromJSON(type.toUpperCase())
}

export const notificationTypeToDto = (type: ProtoNotificationType): NotificationType => {
  return notificationTypeToJSON(type).toLocaleLowerCase() as NotificationType
}

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
      return ProtoNotificationEventType.UNKNOWN_NOTIFICATION_EVENT_TYPE
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
    case ProtoNotificationEventType.UNKNOWN_NOTIFICATION_EVENT_TYPE:
      throw null
  }
}
