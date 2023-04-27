import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import NotificationTeamAccessGuard from './guards/notification.team-access.guard'
import {
  CreateNotificationDto,
  NotificationDetailsDto,
  NotificationDto,
  UpdateNotificationDto,
} from './notification.dto'
import NotificationService from './notification.service'

const PARAM_NOTIFICATION_ID = 'notificationId'
const NotificationId = () => Param(PARAM_NOTIFICATION_ID)

const ROUTE_NOTIFICATIONS = 'notifications'
const ROUTE_NOTIFICATION_ID = ':notificationId'

@Controller(ROUTE_NOTIFICATIONS)
@ApiTags(ROUTE_NOTIFICATIONS)
@UseGuards(NotificationTeamAccessGuard)
export default class NotificationHttpController {
  constructor(private service: NotificationService) {}

  @Get()
  @HttpCode(200)
  @ApiOkResponse({ type: NotificationDto, isArray: true, description: 'Retrieve notifications that belong to a team.' })
  async getNotifications(@IdentityFromRequest() identity: Identity): Promise<NotificationDto[]> {
    return this.service.getNotifications(identity)
  }

  @Get(ROUTE_NOTIFICATION_ID)
  @HttpCode(200)
  @ApiOkResponse({ type: NotificationDetailsDto, description: 'Fetch data that belongs to a notification.' })
  async getNotificationDetails(@NotificationId() notificationId: string): Promise<NotificationDetailsDto> {
    return this.service.getNotificationDetails(notificationId)
  }

  @Post()
  @HttpCode(201)
  @CreatedWithLocation()
  @ApiBody({ type: CreateNotificationDto })
  @ApiCreatedResponse({ type: NotificationDetailsDto, description: 'Create a new notification.' })
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
  @HttpCode(200)
  @ApiOkResponse({ type: NotificationDetailsDto, description: 'Modify a notification.' })
  @UuidParams(PARAM_NOTIFICATION_ID)
  async updateNotification(
    @NotificationId() notificationId: string,
    @Body() request: UpdateNotificationDto,
    @IdentityFromRequest() identity: Identity,
  ) {
    return this.service.updateNotification(notificationId, request, identity)
  }

  @Delete(ROUTE_NOTIFICATION_ID)
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Delete a notification.' })
  @UuidParams(PARAM_NOTIFICATION_ID)
  async deleteNotification(@NotificationId() notificationId: string): Promise<void> {
    this.service.deleteNotification(notificationId)
  }

  @Post(`${ROUTE_NOTIFICATION_ID}/test`)
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Send a test notification.' })
  @UuidParams(PARAM_NOTIFICATION_ID)
  async testNotification(@NotificationId() notificationId: string): Promise<void> {
    this.service.testNotification(notificationId)
  }
}
