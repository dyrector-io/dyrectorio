import { CreateNotification, NotificationDetails, UpdateNotification } from '@app/models'
import {
  AccessRequest,
  CreateNotificationRequest,
  CreateNotificationResponse,
  CruxNotificationClient,
  Empty,
  IdRequest,
  NotificationDetailsResponse,
  NotificationListResponse,
  UpdateEntityResponse,
  UpdateNotificationRequest,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { protomisify } from './grpc-connection'
import { notificationTypeToDto, notificationTypeToGrpc } from './mappers/notification-mapper'

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

    return res.data.map(it => ({
      ...it,
      type: notificationTypeToDto(it.type),
      creator: it.audit.createdBy,
    }))
  }

  async create(dto: CreateNotification): Promise<NotificationDetails> {
    const req: CreateNotificationRequest = {
      ...dto,
      type: notificationTypeToGrpc(dto.type),
      accessedBy: this.identity.id,
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
    }

    const res = await protomisify<UpdateNotificationRequest, UpdateEntityResponse>(
      this.client,
      this.client.updateNotification,
    )(UpdateNotificationRequest, req)

    return timestampToUTC(res.updatedAt)
  }

  async getNotificationDetails(id: string): Promise<NotificationDetails> {
    const req: IdRequest = {
      id,
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
    }
  }

  async delete(id: string) {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteNotification)(IdRequest, req)
  }

  async testNotification(id: string): Promise<void> {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.testNotification)(IdRequest, req)
  }
}

export default DyoNotifcationService
