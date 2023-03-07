import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
import { Empty } from 'src/grpc/protobuf/proto/common'
import {
  CreateNotificationRequest,
  CreateNotificationResponse,
  CruxNotificationController,
  CruxNotificationControllerMethods,
  IdRequest,
  NotificationDetailsResponse,
  NotificationListResponse,
  UpdateEntityResponse,
  UpdateNotificationRequest,
} from 'src/grpc/protobuf/proto/crux'
import { IdentityFromGrpcCall } from 'src/shared/user-access.guard'
import NotificationTeamAccessGuard from './guards/notification.team-access.guard'
import NotificationService from './notification.service'

@Controller()
@CruxNotificationControllerMethods()
@UseGuards(NotificationTeamAccessGuard)
@UseGrpcInterceptors()
export default class NotificationController implements CruxNotificationController {
  constructor(private notificationService: NotificationService) {}

  async createNotification(
    request: CreateNotificationRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<CreateNotificationResponse> {
    return await this.notificationService.createNotification(request, identity)
  }

  async updateNotification(
    request: UpdateNotificationRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<UpdateEntityResponse> {
    return await this.notificationService.updateNotification(request, identity)
  }

  async deleteNotification(request: IdRequest): Promise<void> {
    return await this.notificationService.deleteNotification(request)
  }

  async getNotificationList(
    _: Empty,
    __: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<NotificationListResponse> {
    return await this.notificationService.getNotifications(identity)
  }

  async getNotificationDetails(
    request: IdRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<NotificationDetailsResponse> {
    return await this.notificationService.getNotificationDetails(request, identity)
  }

  async testNotification(request: IdRequest): Promise<Empty> {
    return await this.notificationService.testNotification(request)
  }
}
