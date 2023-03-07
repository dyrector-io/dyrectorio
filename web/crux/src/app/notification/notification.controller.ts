import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards } from '@nestjs/common'
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
import { getIdentity } from 'src/interceptors/grpc.user.interceptor'
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
    metadata: Metadata,
  ): Promise<CreateNotificationResponse> {
    return await this.notificationService.createNotification(request, getIdentity(metadata))
  }

  async updateNotification(request: UpdateNotificationRequest, metadata: Metadata): Promise<UpdateEntityResponse> {
    return await this.notificationService.updateNotification(request, getIdentity(metadata))
  }

  async deleteNotification(request: IdRequest): Promise<void> {
    return await this.notificationService.deleteNotification(request)
  }

  async getNotificationList(_: Empty, metadata: Metadata): Promise<NotificationListResponse> {
    return await this.notificationService.getNotifications(getIdentity(metadata))
  }

  async getNotificationDetails(request: IdRequest, metadata: Metadata): Promise<NotificationDetailsResponse> {
    return await this.notificationService.getNotificationDetails(request, getIdentity(metadata))
  }

  async testNotification(request: IdRequest): Promise<Empty> {
    return await this.notificationService.testNotification(request)
  }
}
