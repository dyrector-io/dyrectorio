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
import { IdentityAwareServerSurfaceCall } from 'src/shared/user-access.guard'
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
    call: IdentityAwareServerSurfaceCall,
  ): Promise<CreateNotificationResponse> {
    return await this.notificationService.createNotification(request, call.user)
  }

  async updateNotification(
    request: UpdateNotificationRequest,
    _: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<UpdateEntityResponse> {
    return await this.notificationService.updateNotification(request, call.user)
  }

  async deleteNotification(request: IdRequest): Promise<void> {
    return await this.notificationService.deleteNotification(request)
  }

  async getNotificationList(
    _: Empty,
    __: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<NotificationListResponse> {
    return await this.notificationService.getNotifications(call.user)
  }

  async getNotificationDetails(
    request: IdRequest,
    _: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<NotificationDetailsResponse> {
    return await this.notificationService.getNotificationDetails(request, call.user)
  }

  async testNotification(request: IdRequest): Promise<Empty> {
    return await this.notificationService.testNotification(request)
  }
}
