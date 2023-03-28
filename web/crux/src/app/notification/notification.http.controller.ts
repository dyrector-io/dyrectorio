import { Body, Controller, Delete, Get, Put, Param, Post, HttpCode, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import NotificationTeamAccessGuard from './guards/notification.team-access.guard'
import {
  CreateNotificationDto,
  NotificationDetailsDto,
  NotificationDto,
  UpdateNotificationDto,
} from './notification.dto'
import NotificationService from './notification.service'

const ROUTE_NOTIFICATIONS = 'notifications'
const ROUTE_NOTIFICATION_ID = ':notificationId'
const NotificationId = () => Param('notificationId')

@Controller(ROUTE_NOTIFICATIONS)
@ApiTags(ROUTE_NOTIFICATIONS)
@UseGuards(JwtAuthGuard, NotificationTeamAccessGuard)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
export default class NotificationHttpController {
  constructor(private service: NotificationService) {}

  @Get()
  @ApiOkResponse({ type: NotificationDto, isArray: true })
  async getNotifications(@IdentityFromRequest() identity: Identity): Promise<NotificationDto[]> {
    return this.service.getNotifications(identity)
  }

  @Get(ROUTE_NOTIFICATION_ID)
  @ApiOkResponse({ type: NotificationDetailsDto })
  async getNotificationDetails(@NotificationId() notificationId: string): Promise<NotificationDetailsDto> {
    return this.service.getNotificationDetails(notificationId)
  }

  @Post()
  @CreatedWithLocation()
  @ApiBody({ type: CreateNotificationDto })
  @ApiCreatedResponse({ type: NotificationDetailsDto })
  async createNotification(
    @Body() request: CreateNotificationDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<NotificationDto>> {
    const notification = await this.service.createNotification(request, identity)

    return {
      url: `${ROUTE_NOTIFICATIONS}/${notification.id}`,
      body: notification,
    }
  }

  @Put(ROUTE_NOTIFICATION_ID)
  @HttpCode(204)
  @ApiNoContentResponse({ type: NotificationDetailsDto })
  async updateNotification(
    @NotificationId() notificationId: string,
    @Body() request: UpdateNotificationDto,
    @IdentityFromRequest() identity: Identity,
  ) {
    return this.service.updateNotification(notificationId, request, identity)
  }

  @Delete(ROUTE_NOTIFICATION_ID)
  @HttpCode(204)
  async deleteNotification(@NotificationId() notificationId: string): Promise<void> {
    this.service.deleteNotification(notificationId)
  }

  @Post(`${ROUTE_NOTIFICATION_ID}/test`)
  @HttpCode(204)
  async testNotification(@NotificationId() notificationId: string): Promise<void> {
    this.service.testNotification(notificationId)
  }
}
