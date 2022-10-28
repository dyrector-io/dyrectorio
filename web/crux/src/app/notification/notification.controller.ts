import { Controller, UseGuards } from '@nestjs/common'
import { Empty } from 'src/grpc/protobuf/proto/common'
import {
  AccessRequest,
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
import NotificationTeamAccessGuard from './guards/notification.team-access.guard'
import NotificationService from './notification.service'

@Controller()
@CruxNotificationControllerMethods()
@UseGuards(NotificationTeamAccessGuard)
export default class NotificationController implements CruxNotificationController {
  constructor(private notificationService: NotificationService) {}

  async createNotification(request: CreateNotificationRequest): Promise<CreateNotificationResponse> {
    return await this.notificationService.createNotification(request)
  }

  async updateNotification(request: UpdateNotificationRequest): Promise<UpdateEntityResponse> {
    return await this.notificationService.updateNotification(request)
  }

  async deleteNotification(request: IdRequest): Promise<void> {
    return await this.notificationService.deleteNotification(request)
  }

  async getNotificationList(request: AccessRequest): Promise<NotificationListResponse> {
    return await this.notificationService.getNotifications(request)
  }

  async getNotificationDetails(request: IdRequest): Promise<NotificationDetailsResponse> {
    return await this.notificationService.getNotificationDetails(request)
  }

  async testNotification(request: IdRequest): Promise<Empty> {
    return await this.notificationService.testNotification(request)
  }
}
