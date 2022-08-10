import { Logger } from '@app/logger'
import {
  CreateNotification,
  NotificationDetails,
  NotificationItem,
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
  NotificationListResponse,
  NotificationType as ProtoNotificationType,
  notificationTypeFromJSON,
  notificationTypeToJSON,
  TestNotificationRequest,
  TestNotificationResponse,
  UpdateEntityResponse,
  UpdateNotificationRequest,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { protomisify } from './grpc-connection'

class DyoNotifcationService {
  private logger = new Logger(DyoNotifcationService.name)

  constructor(private client: CruxNotificationClient, private identity: Identity) {}

  async getAll(): Promise<NotificationItem[]> {
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
        type: toDtoNotificationType(it.type),
        createdBy: it.audit.createdBy,
      }
    })
  }

  async create(dto: CreateNotification): Promise<NotificationDetails> {
    const req: CreateNotificationRequest = {
      ...dto,
      type: toGrpcNotificationType(dto.type),
      accessedBy: this.identity.id,
    }

    const res = await protomisify<CreateNotificationRequest, CreateNotificationResponse>(
      this.client,
      this.client.createNotification,
    )(CreateNotificationRequest, req)

    return {
      ...dto,
      id: res.id,
      createdBy: res.createdBy,
    }
  }

  async update(dto: UpdateNotification): Promise<string> {
    const req: UpdateNotificationRequest = {
      ...dto,
      type: toGrpcNotificationType(dto.type),
      accessedBy: this.identity.id,
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
      this.client.getNotificationDetail,
    )(IdRequest, req)

    return {
      ...res,
      type: toDtoNotificationType(res.type),
      createdBy: res.audit.createdBy,
    }
  }

  async delete(id: string) {
    const req: IdRequest = {
      id: id,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteNotification)(IdRequest, req)
  }

  async testNotification(url: string): Promise<boolean> {
    const req: TestNotificationRequest = {
      url: url,
      accessedBy: this.identity.id,
    }

    var res = await protomisify<TestNotificationRequest, TestNotificationResponse>(
      this.client,
      this.client.testNotification,
    )(TestNotificationRequest, req)

    return res.ok
  }
}

export default DyoNotifcationService

export const toGrpcNotificationType = (type: NotificationType): ProtoNotificationType => {
  return notificationTypeFromJSON(type.toUpperCase())
}

export const toDtoNotificationType = (type: ProtoNotificationType): NotificationType => {
  return notificationTypeToJSON(type).toLocaleLowerCase() as NotificationType
}
