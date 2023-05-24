import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator'
import { ContainerState } from 'src/domain/container'
import { ContainerIdentifierDto } from '../container/container.dto'

export const NODE_SCRIPT_TYPE_VALUES = ['shell', 'powershell'] as const
export type NodeScriptTypeDto = (typeof NODE_SCRIPT_TYPE_VALUES)[number]

export const NODE_CONNECTION_STATUS_VALUES = ['unreachable', 'connected', 'outdated'] as const
export type NodeConnectionStatus = (typeof NODE_CONNECTION_STATUS_VALUES)[number]

export const NODE_TYPE_VALUES = ['docker', 'k8s'] as const
export type NodeType = (typeof NODE_TYPE_VALUES)[number]

export class BasicNodeDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @ApiProperty({ enum: NODE_TYPE_VALUES })
  @IsIn(NODE_TYPE_VALUES)
  type: NodeType
}

export class BasicNodeWithStatus extends BasicNodeDto {
  @IsString()
  @IsIn(NODE_CONNECTION_STATUS_VALUES)
  @ApiProperty({
    enum: NODE_CONNECTION_STATUS_VALUES,
  })
  @IsOptional()
  status?: NodeConnectionStatus
}

export class NodeDto extends BasicNodeDto {
  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  icon?: string

  @IsString()
  @IsOptional()
  address?: string

  @IsString()
  @IsIn(NODE_CONNECTION_STATUS_VALUES)
  @ApiProperty({
    enum: NODE_CONNECTION_STATUS_VALUES,
  })
  @IsOptional()
  status?: NodeConnectionStatus

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  connectedAt?: Date

  @IsString()
  @IsOptional()
  version?: string

  @IsBoolean()
  @IsOptional()
  updating?: boolean
}

export class NodeInstallDto {
  @IsString()
  command: string

  @IsString()
  script: string

  @IsDate()
  @Type(() => Date)
  expireAt: Date
}

export class NodeDetailsDto extends NodeDto {
  @IsBoolean()
  hasToken: boolean

  @IsOptional()
  @ValidateNested()
  @IsOptional()
  install?: NodeInstallDto
}

export class CreateNodeDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  icon?: string
}

export class UpdateNodeDto extends CreateNodeDto {}

export class DagentTraefikOptionsDto {
  @IsEmail()
  acmeEmail: string
}

export class NodeGenerateScriptDto {
  @IsString()
  @IsIn(NODE_TYPE_VALUES)
  @ApiProperty({
    enum: NODE_TYPE_VALUES,
  })
  type: NodeType

  @IsString()
  @IsOptional()
  rootPath?: string

  @IsString()
  @IsIn(NODE_SCRIPT_TYPE_VALUES)
  @ApiProperty({
    enum: NODE_SCRIPT_TYPE_VALUES,
  })
  scriptType: NodeScriptTypeDto

  @IsObject()
  @ValidateNested()
  @IsOptional()
  dagentTraefik?: DagentTraefikOptionsDto
}

export type ContainerOperationDto = 'start' | 'stop' | 'restart'

export class NodeContainerCommandDto {
  @ValidateNested()
  container: ContainerIdentifierDto

  @ValidateNested()
  operation: ContainerOperationDto
}

export class NodeDeleteContainerDto {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  container?: ContainerIdentifierDto

  @IsString()
  @IsOptional()
  prefix?: string
}

export class ContainerPort {
  internal: number

  external: number
}

export class ContainerDto {
  id: ContainerIdentifierDto

  command: string

  @Type(() => Date)
  @IsDate()
  createdAt: Date

  state: ContainerState

  reason: string

  status: string

  imageName: string

  imageTag: string

  ports: ContainerPort[]
}
