import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsEmail, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'
import { BasicTeamDto } from './team.dto'

export const USER_ROLE_VALUES = ['owner', 'admin', 'user'] as const
export type UserRoleDto = (typeof USER_ROLE_VALUES)[number]

export const USER_STATUS_VALUES = ['pending', 'verified', 'expired', 'declined'] as const
export type UserStatusDto = (typeof USER_STATUS_VALUES)[number]

export class BasicUserDto {
  @IsUUID()
  id: string

  @IsString()
  name: string
}

export class UserDto extends BasicUserDto {
  @IsEmail()
  email: string

  @ApiProperty({ enum: USER_ROLE_VALUES })
  role: UserRoleDto

  @ApiProperty({ enum: USER_STATUS_VALUES })
  status: UserStatusDto

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  lastLogin?: Date
}

export class UserMetaTeamDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  slug: string

  @ApiProperty({ enum: USER_ROLE_VALUES })
  role: UserRoleDto
}

export class UserMetaDto {
  @ValidateNested()
  user: BasicUserDto

  @ValidateNested()
  teams: UserMetaTeamDto[]

  @ValidateNested()
  invitations: BasicTeamDto[]
}
