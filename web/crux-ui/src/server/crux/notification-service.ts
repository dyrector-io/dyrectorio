import { CreateNotification, NotificationDetails, UpdateNotification } from '@app/models'
import { Empty } from '@app/models/grpc/protobuf/proto/common'
import {
  CreateNotificationRequest,
  CreateNotificationResponse,
  CruxNotificationClient,
  IdRequest,
  NotificationDetailsResponse,
  NotificationListResponse,
  UpdateEntityResponse,
  UpdateNotificationRequest,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { protomisify } from './grpc-connection'
import {
  notificationEventTypeToDto,
  notificationEventTypeToGrpc,
  notificationTypeToDto,
  notificationTypeToGrpc,
} from './mappers/notification-mappers'

class DyoNotifcationService {
  constructor(private client: CruxNotificationClient, private cookie: string) {}

  async getAll(): Promise<NotificationDetails[]> {
    const res = await protomisify<Empty, NotificationListResponse>(
      this.client,
      this.client.getNotificationList,
      this.cookie,
    )(Empty, {})

    return res.data.map(it => ({
      ...it,
      type: notificationTypeToDto(it.type),
      creator: it.audit.createdBy,
      events: it.events.map(ev => notificationEventTypeToDto(ev)),
    }))
  }

  async create(dto: CreateNotification): Promise<NotificationDetails> {
    const req: CreateNotificationRequest = {
      ...dto,
      type: notificationTypeToGrpc(dto.type),
      events: dto.events.map(ev => notificationEventTypeToGrpc(ev)),
    }

    const res = await protomisify<CreateNotificationRequest, CreateNotificationResponse>(
      this.client,
      this.client.createNotification,
      this.cookie,
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
      events: dto.events.map(ev => notificationEventTypeToGrpc(ev)),
    }

    const res = await protomisify<UpdateNotificationRequest, UpdateEntityResponse>(
      this.client,
      this.client.updateNotification,
      this.cookie,
    )(UpdateNotificationRequest, req)

    return timestampToUTC(res.updatedAt)
  }

  async getNotificationDetails(id: string): Promise<NotificationDetails> {
    const req: IdRequest = {
      id,
    }

    const res = await protomisify<IdRequest, NotificationDetailsResponse>(
      this.client,
      this.client.getNotificationDetails,
      this.cookie,
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
      id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteNotification, this.cookie)(IdRequest, req)
  }

  async testNotification(id: string): Promise<void> {
    const req: IdRequest = {
      id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.testNotification, this.cookie)(IdRequest, req)
  }
}

export default DyoNotifcationService
