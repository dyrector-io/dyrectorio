import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../../interceptors/created-with-location.decorator'
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Response should include `type`, `id`, `name`, `url`, `active`, and `creatorName`.',
    summary: 'Retrieve notifications that belong to a team.',
  })
  @ApiOkResponse({ type: NotificationDto, isArray: true, description: 'Notifications listed.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for notifications.' })
  async getNotifications(@IdentityFromRequest() identity: Identity): Promise<NotificationDto[]> {
    return this.service.getNotifications(identity)
  }

  @Get(ROUTE_NOTIFICATION_ID)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Request must include `notificationId` parameter. Response should include `type`, `enabledEvents`, `id`, `name`, `url`, `active`, and `creatorName`.',
    summary: 'Fetch details of a notification.',
  })
  @ApiOkResponse({ type: NotificationDetailsDto, description: 'Details of notification listed.' })
  @ApiBadRequestResponse({ description: 'Bad request for notification details.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for notification details.' })
  @ApiNotFoundResponse({ description: 'Notification not found.' })
  async getNotificationDetails(@NotificationId() notificationId: string): Promise<NotificationDetailsDto> {
    return this.service.getNotificationDetails(notificationId)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description:
      'Request must include `type`, `enabledEvents`, `id`, `name`, `url`, and `active`. Response should list `type`, `enabledEvents`, `id`, `name`, `url`, `active`, and `creatorName`.',
    summary: 'Create a new notification.',
  })
  @CreatedWithLocation()
  @ApiBody({ type: CreateNotificationDto })
  @ApiCreatedResponse({ type: NotificationDetailsDto, description: 'New notification created.' })
  @ApiBadRequestResponse({ description: 'Bad request for a notification.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for a notification.' })
  @ApiConflictResponse({ description: 'Notification name taken.' })
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description:
      'Request must include `notificationId`, `type`, `enabledEvents`, `id`, `name`, `url`, and `active`. Response should include `type`, `enabledEvents`, `id`, `name`, `url`, `active`, and `creatorName`.',
    summary: 'Modify a notification.',
  })
  @ApiOkResponse({ type: NotificationDetailsDto, description: 'Notification modified.' })
  @ApiBadRequestResponse({ description: 'Bad request for a notification.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for a notification.' })
  @ApiNotFoundResponse({ description: 'Notification not found.' })
  @ApiConflictResponse({ description: 'Notification name taken.' })
  @UuidParams(PARAM_NOTIFICATION_ID)
  async updateNotification(
    @NotificationId() notificationId: string,
    @Body() request: UpdateNotificationDto,
    @IdentityFromRequest() identity: Identity,
  ) {
    return this.service.updateNotification(notificationId, request, identity)
  }

  @Delete(ROUTE_NOTIFICATION_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `notificationId`.',
    summary: 'Delete a notification.',
  })
  @ApiNoContentResponse({ description: 'Notification deleted.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for notification delete.' })
  @ApiNotFoundResponse({ description: 'Notification not found.' })
  @UuidParams(PARAM_NOTIFICATION_ID)
  async deleteNotification(@NotificationId() notificationId: string): Promise<void> {
    this.service.deleteNotification(notificationId)
  }

  @Post(`${ROUTE_NOTIFICATION_ID}/test`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `notificationId`.',
    summary: 'Send a test message.',
  })
  @ApiNoContentResponse({ description: 'Test message sent.' })
  @ApiBadRequestResponse({ description: 'Bad request for a test message.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for a test message.' })
  @UuidParams(PARAM_NOTIFICATION_ID)
  async testNotification(@NotificationId() notificationId: string): Promise<void> {
    this.service.testNotification(notificationId)
  }
}
