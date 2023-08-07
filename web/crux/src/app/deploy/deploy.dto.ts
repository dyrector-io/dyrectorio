import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger'
import { Deployment, DeploymentToken, Instance, InstanceContainerConfig, Node, Project, Version } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsInt,
  IsJWT,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator'
import { CONTAINER_STATE_VALUES, ContainerState } from 'src/domain/container'
import { PaginatedList, PaginationQuery } from 'src/shared/dtos/paginating'
import { BasicProperties } from '../../shared/dtos/shared.dto'
import { AuditDto } from '../audit/audit.dto'
import {
  ContainerConfigDto,
  ContainerIdentifierDto,
  UniqueKeyValueDto,
  UniqueSecretKeyValueDto,
} from '../container/container.dto'
import { ImageDto } from '../image/image.dto'
import { ImageEvent } from '../image/image.event'
import { ImageDetails } from '../image/image.mapper'
import { BasicNodeDto, BasicNodeWithStatus } from '../node/node.dto'
import { BasicProjectDto } from '../project/project.dto'
import { BasicVersionDto } from '../version/version.dto'

const DEPLOYMENT_STATUS_VALUES = ['preparing', 'in-progress', 'successful', 'failed', 'obsolete'] as const
export type DeploymentStatusDto = (typeof DEPLOYMENT_STATUS_VALUES)[number]

export class BasicDeploymentDto {
  @IsUUID()
  id: string

  @IsString()
  prefix: string

  @IsBoolean()
  protected: boolean

  @ApiProperty({ enum: DEPLOYMENT_STATUS_VALUES })
  @IsIn(DEPLOYMENT_STATUS_VALUES)
  status: DeploymentStatusDto
}

export class DeploymentDto extends BasicDeploymentDto {
  @IsString()
  @IsOptional()
  note?: string | null

  @ValidateNested()
  audit: AuditDto

  @ValidateNested()
  project: BasicProjectDto

  @ValidateNested()
  version: BasicVersionDto

  @ValidateNested()
  node: BasicNodeDto
}

export class DeploymentWithBasicNodeDto extends BasicDeploymentDto {
  @IsString()
  @IsOptional()
  note?: string

  @Type(() => Date)
  @IsDate()
  updatedAt: Date

  @ValidateNested()
  node: BasicNodeWithStatus
}

export class InstanceContainerConfigDto extends OmitType(PartialType(ContainerConfigDto), ['secrets']) {
  @IsOptional()
  @ValidateNested({ each: true })
  secrets?: UniqueSecretKeyValueDto[]
}

export class InstanceDto {
  @IsUUID()
  id: string

  @Type(() => Date)
  @IsDate()
  updatedAt: Date

  @ValidateNested()
  image: ImageDto

  @IsOptional()
  @ValidateNested()
  config?: InstanceContainerConfigDto | null
}

export class DeploymentTokenDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsDate()
  @Type(() => Date)
  createdAt: Date

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiresAt?: Date | null
}

export class CreateDeploymentTokenDto {
  @IsString()
  @MinLength(3)
  name: string

  @IsInt()
  @Min(1)
  @IsOptional()
  expirationInDays?: number
}

export class DeploymentTokenCreatedDto extends DeploymentTokenDto {
  @IsJWT()
  token: string

  @IsString()
  curl: string
}

export class DeploymentDetailsDto extends DeploymentDto {
  @ValidateNested({ each: true })
  environment: UniqueKeyValueDto[]

  @IsString()
  @IsOptional()
  publicKey?: string | null

  @ValidateNested()
  instances: InstanceDto[]

  @IsInt()
  @Min(0)
  lastTry: number

  @ValidateNested()
  token: DeploymentTokenDto
}

export class CreateDeploymentDto {
  @IsUUID()
  versionId: string

  @IsUUID()
  nodeId: string

  @IsString()
  prefix: string

  @IsString()
  @IsOptional()
  note?: string | null
}

export class PatchDeploymentDto {
  @IsString()
  @IsOptional()
  note?: string | null

  @IsString()
  @IsOptional()
  prefix?: string | null

  @IsBoolean()
  @IsOptional()
  protected?: boolean

  @IsOptional()
  @ValidateNested({ each: true })
  environment?: UniqueKeyValueDto[] | null
}

export class PatchInstanceDto {
  @ValidateNested()
  config: InstanceContainerConfigDto
}

export class CopyDeploymentDto {
  @IsUUID()
  nodeId: string

  @IsString()
  prefix: string

  @IsString()
  @IsOptional()
  note?: string | null
}

export const DEPLOYMENT_EVENT_TYPE_VALUES = ['log', 'deployment-status', 'container-state'] as const
export type DeploymentEventTypeDto = (typeof DEPLOYMENT_EVENT_TYPE_VALUES)[number]

export class DeploymentEventContainerStateDto {
  @IsUUID()
  instanceId: string

  @ApiProperty({ enum: CONTAINER_STATE_VALUES })
  @IsIn(CONTAINER_STATE_VALUES)
  @IsOptional()
  state?: ContainerState
}

export class DeploymentEventDto {
  @ApiProperty({ enum: DEPLOYMENT_EVENT_TYPE_VALUES })
  @IsIn(DEPLOYMENT_EVENT_TYPE_VALUES)
  type: DeploymentEventTypeDto

  @Type(() => Date)
  @IsDate()
  createdAt: Date

  @IsString({ each: true })
  @IsOptional()
  log?: string[] | null

  @ApiProperty({ enum: DEPLOYMENT_STATUS_VALUES })
  @IsIn(DEPLOYMENT_STATUS_VALUES)
  @IsOptional()
  deploymentStatus?: DeploymentStatusDto | null

  @IsOptional()
  containerState?: DeploymentEventContainerStateDto | null
}

export class InstanceSecretsDto {
  @ValidateNested()
  container: ContainerIdentifierDto

  @IsString()
  publicKey: string

  @IsOptional()
  @IsString({ each: true })
  keys?: string[] | null
}

export class DeploymentLogListDto extends PaginatedList<DeploymentEventDto> {
  @ValidateNested({ each: true })
  items: DeploymentEventDto[]

  @IsInt()
  total: number
}

export class DeploymentLogPaginationQuery extends PaginationQuery {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty()
  readonly try?: number
}

export class StartDeploymentDto {
  @IsOptional()
  @IsString({ each: true })
  instances?: string[]
}

export type DeploymentImageEvent = ImageEvent & {
  deploymentIds?: string[]
  instances?: InstanceDetails[]
}

export type DeploymentWithNode = Deployment & {
  node: Pick<Node, BasicProperties>
}

export type DeploymentWithNodeVersion = DeploymentWithNode & {
  version: Pick<Version, BasicProperties> & {
    project: Pick<Project, BasicProperties>
  }
}

export type InstanceDetails = Instance & {
  image: ImageDetails
  config?: InstanceContainerConfig
}

export type DeploymentDetails = DeploymentWithNodeVersion & {
  tokens: Pick<DeploymentToken, 'id' | 'name' | 'createdAt' | 'expiresAt'>[]
  instances: InstanceDetails[]
}
