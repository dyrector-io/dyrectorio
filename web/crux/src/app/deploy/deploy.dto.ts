import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsIn, IsInt, IsOptional, IsString, IsUUID } from 'class-validator'
import { ContainerState, CONTAINER_STATE_VALUES, UniqueKeyValue, UniqueSecretKeyValue } from 'src/shared/models'
import { PaginatedList, PaginationQuery } from 'src/shared/dtos/paginating'
import { Deployment, Instance, InstanceContainerConfig, Node, Product, Version } from '@prisma/client'
import { ContainerConfigDto, ImageDto } from '../image/image.dto'
import {
  AuditDto,
  BasicNodeDto,
  BasicNodeWithStatus,
  BasicProductDto,
  BasicProperties,
  BasicVersionDto,
  ContainerIdentifierDto,
} from '../shared/shared.dto'
import { ImageDetails } from '../image/image.mapper'
import { ImageEvent } from '../image/image.event'

const DEPLOYMENT_STATUS_VALUES = ['preparing', 'in-progress', 'successful', 'failed', 'obsolete'] as const
export type DeploymentStatusDto = (typeof DEPLOYMENT_STATUS_VALUES)[number]

export class BasicDeploymentDto {
  @IsUUID()
  id: string

  @IsString()
  prefix: string

  @ApiProperty({ enum: DEPLOYMENT_STATUS_VALUES })
  @IsIn(DEPLOYMENT_STATUS_VALUES)
  status: DeploymentStatusDto
}

export class DeploymentDto extends BasicDeploymentDto {
  @IsString()
  @IsOptional()
  note?: string | null

  audit: AuditDto

  product: BasicProductDto

  version: BasicVersionDto

  node: BasicNodeDto
}

export class DeploymentWithBasicNodeDto extends BasicDeploymentDto {
  @IsString()
  @IsOptional()
  note?: string | null

  @Type(() => Date)
  @IsDate()
  updatedAt: Date

  node: BasicNodeWithStatus
}

export class InstanceContainerConfigDto extends OmitType(PartialType(ContainerConfigDto), ['secrets']) {
  @IsOptional()
  secrets?: UniqueSecretKeyValue[] | null
}

export class InstanceDto {
  @IsUUID()
  id: string

  @Type(() => Date)
  @IsDate()
  updatedAt: Date

  image: ImageDto

  @ApiProperty({ enum: CONTAINER_STATE_VALUES })
  @IsIn(CONTAINER_STATE_VALUES)
  @IsOptional()
  state?: ContainerState | null

  @IsOptional()
  config?: InstanceContainerConfigDto | null
}

export class DeploymentDetailsDto extends DeploymentDto {
  environment: UniqueKeyValue[]

  @IsString()
  @IsOptional()
  publicKey?: string | null

  instances: InstanceDto[]

  lastTry: number
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

  @IsOptional()
  environment?: UniqueKeyValue[]
}

export class PatchInstanceDto {
  config: InstanceContainerConfigDto
}

export const DEPLOYMENT_EVENT_TYPE_VALUES = ['log', 'deployment-status', 'container-status'] as const
export type DeploymentEventTypeDto = (typeof DEPLOYMENT_EVENT_TYPE_VALUES)[number]

export class DeploymentEventContainerStateDto {
  @IsUUID()
  instanceId: string

  @ApiProperty({ enum: CONTAINER_STATE_VALUES })
  @IsIn(CONTAINER_STATE_VALUES)
  state: ContainerState
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
  container: ContainerIdentifierDto

  publicKey: string

  @IsOptional()
  @IsString({ each: true })
  keys?: string[] | null
}

export class DeploymentLogListDto extends PaginatedList<DeploymentEventDto> {
  @Type(() => DeploymentEventDto)
  items: DeploymentEventDto[]

  total: number
}

export class DeploymentLogPaginationQuery extends PaginationQuery {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty()
  readonly try?: number
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
    product: Pick<Product, BasicProperties>
  }
}

export type InstanceDetails = Instance & {
  image: ImageDetails
  config?: InstanceContainerConfig
}

export type DeploymentDetails = DeploymentWithNodeVersion & {
  instances: InstanceDetails[]
}
