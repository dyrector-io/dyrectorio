import { Controller, UseGuards } from '@nestjs/common'
import {
  AccessRequest,
  CreateNotificationRequest,
  CreateNotificationResponse,
  CruxNotificationController,
  CruxNotificationControllerMethods,
  IdRequest,
  NotificationDetailsResponse,
  NotificationListResponse,
  TestNotificationRequest,
  TestNotificationResponse,
  UpdateEntityResponse,
  UpdateNotificationRequest,
} from 'src/grpc/protobuf/proto/crux'
import { TeamRoleRequired } from '../team/guards/team.role.guard'
import { NotificationTeamAccessGuard } from './guards/notification.team-access.guard'
import { NotificationService } from './notification.service'

@Controller()
@CruxNotificationControllerMethods()
@UseGuards(NotificationTeamAccessGuard)
export class NotificationController implements CruxNotificationController {
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

  async getNotificationDetail(request: IdRequest): Promise<NotificationDetailsResponse> {
    return await this.notificationService.getNotificationDetail(request)
  }

  @TeamRoleRequired('none')
  async testNotification(request: TestNotificationRequest): Promise<TestNotificationResponse> {
    return await this.notificationService.testNotification(request)
  }
}
