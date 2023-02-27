import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards, UseInterceptors } from '@nestjs/common'
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
import GrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import GrpcUserInterceptor, { getIdentity } from 'src/interceptors/grpc.user.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import NotificationTeamAccessGuard from './guards/notification.team-access.guard'
import NotificationService from './notification.service'

@Controller()
@CruxNotificationControllerMethods()
@UseGuards(NotificationTeamAccessGuard)
@UseInterceptors(GrpcLoggerInterceptor, GrpcUserInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
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
