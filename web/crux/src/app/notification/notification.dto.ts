import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsIn, IsString, IsUrl } from 'class-validator'

export const NOTIFICATION_TYPE_VALUES = ['discord', 'slack', 'teams'] as const
export type NotificationTypeDto = (typeof NOTIFICATION_TYPE_VALUES)[number]

export const NOTIFICATION_EVENT_TYPE_VALUES = [
  'deployment-created',
  'version-created',
  'node-added',
  'user-invited',
] as const
export type NotificationEventTypeDto = (typeof NOTIFICATION_EVENT_TYPE_VALUES)[number]

export class NotificationDto {
  id: string

  name: string

  url: string

  @ApiProperty({ enum: NOTIFICATION_TYPE_VALUES })
  type: NotificationTypeDto

  active: boolean

  creator: string
}

export class NotificationDetailsDto extends NotificationDto {
  @ApiProperty({
    enum: NOTIFICATION_EVENT_TYPE_VALUES,
    isArray: true,
  })
  events: NotificationEventTypeDto[]
}

export class CreateNotificationDto {
  @IsString()
  name: string

  @IsUrl()
  url: string

  @IsString()
  @IsIn(NOTIFICATION_TYPE_VALUES)
  @ApiProperty({ enum: NOTIFICATION_TYPE_VALUES })
  type: NotificationTypeDto

  @IsBoolean()
  active: boolean

  @IsString()
  @IsIn(NOTIFICATION_EVENT_TYPE_VALUES)
  @ApiProperty({ enum: NOTIFICATION_EVENT_TYPE_VALUES })
  events: NotificationEventTypeDto[]
}

export class UpdateNotificationDto {
  @IsString()
  name: string

  @IsUrl()
  url: string

  @IsString()
  @IsIn(NOTIFICATION_TYPE_VALUES)
  @ApiProperty({ enum: NOTIFICATION_TYPE_VALUES })
  type: NotificationTypeDto

  @IsBoolean()
  active: boolean

  @IsString()
  @IsIn(NOTIFICATION_EVENT_TYPE_VALUES)
  @ApiProperty({ enum: NOTIFICATION_EVENT_TYPE_VALUES })
  events: NotificationEventTypeDto[]
}
