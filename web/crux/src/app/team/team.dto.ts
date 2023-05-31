import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { UserDto, UserRoleDto, USER_ROLE_VALUES } from './user.dto'

export class BasicTeamDto {
  @IsUUID()
  id: string

  @IsString()
  name: string
}

export class CreateTeamDto {
  @IsString()
  name: string
}

export class UpdateTeamDto extends CreateTeamDto {}

export class TeamStatisticsDto {
  @IsNumber()
  users: number

  @IsNumber()
  projects: number

  @IsNumber()
  nodes: number

  @IsNumber()
  versions: number

  @IsNumber()
  deployments: number
}

export class TeamDto extends BasicTeamDto {
  statistics: TeamStatisticsDto
}

export class TeamDetailsDto extends TeamDto {
  users: UserDto[]
}

export class UpdateUserRoleDto {
  @ApiProperty({ enum: USER_ROLE_VALUES })
  role: UserRoleDto
}

export class ActivateTeamDto {
  @IsUUID()
  teamId: string
}

export class InviteUserDto {
  @IsEmail()
  email: string

  @IsString()
  firstName: string

  @IsString()
  @IsOptional()
  lastName?: string

  @IsString()
  @IsOptional()
  captcha?: string
}
