import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import {
  ContainerConfigContainer,
  ContainerConfigExposeStrategy,
  ContainerConfigHealthCheck,
  ContainerConfigIngress,
  ContainerConfigLog,
  ContainerConfigPort,
  ContainerConfigPortRange,
  ContainerConfigResourceConfig,
  ContainerConfigVolume,
  ContainerDeploymentStrategyType,
  ContainerNetworkMode,
  ContainerRestartPolicyType,
  CONTAINER_DEPLOYMENT_STRATEGY_VALUES,
  CONTAINER_EXPOSE_STRATEGY_VALUES,
  CONTAINER_NETWORK_MODE_VALUES,
  CONTAINER_RESTART_POLICY_TYPE_VALUES,
  InitContainer,
  Marker,
  UniqueKey,
  UniqueKeyValue,
  UniqueSecretKey,
} from 'src/shared/models'
import { BasicRegistryDto } from '../registry/registry.dto'

export class ImageDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  tag: string

  @IsNumber()
  order: number

  // TODO (@polaroi8d): Missing the DTO in the validator
  config: ContainerConfigDto

  @Type(() => Date)
  @IsDate()
  createdAt: Date

  @Type(() => BasicRegistryDto)
  registry: BasicRegistryDto
}

export class AddImagesDto {
  @IsUUID()
  registryId: string

  images: string[]
}

export class PatchImageDto {
  @IsString()
  @IsOptional()
  tag?: string | null

  @IsOptional()
  config?: Partial<ContainerConfigDto> | null
}

export class ContainerStorageDto {
  @IsUUID()
  @IsOptional()
  storageId?: string

  @IsString()
  @IsOptional()
  path?: string

  @IsString()
  @IsOptional()
  bucket?: string
}

export class ContainerConfigDto {
  // common
  name: string

  @IsOptional()
  environment?: UniqueKeyValue[]

  @IsOptional()
  secrets?: UniqueSecretKey[]

  @IsOptional()
  ingress?: ContainerConfigIngress

  @ApiProperty({
    enum: CONTAINER_EXPOSE_STRATEGY_VALUES,
  })
  expose: ContainerConfigExposeStrategy

  @IsOptional()
  user?: number

  tty: boolean

  @IsOptional()
  configContainer?: ContainerConfigContainer

  @IsOptional()
  ports?: ContainerConfigPort[]

  @IsOptional()
  portRanges?: ContainerConfigPortRange[]

  @IsOptional()
  volumes?: ContainerConfigVolume[]

  @IsOptional()
  commands?: UniqueKey[]

  @IsOptional()
  args?: UniqueKey[]

  @IsOptional()
  initContainers?: InitContainer[]

  capabilities: UniqueKeyValue[]

  @IsOptional()
  storage?: ContainerStorageDto

  // dagent
  @IsOptional()
  logConfig?: ContainerConfigLog

  @ApiProperty({
    enum: CONTAINER_RESTART_POLICY_TYPE_VALUES,
  })
  restartPolicy: ContainerRestartPolicyType

  @ApiProperty({
    enum: CONTAINER_NETWORK_MODE_VALUES,
  })
  networkMode: ContainerNetworkMode

  @IsOptional()
  networks?: UniqueKey[]

  @IsOptional()
  dockerLabels?: UniqueKeyValue[]

  // crane
  @ApiProperty({
    enum: CONTAINER_DEPLOYMENT_STRATEGY_VALUES,
  })
  deploymentStrategy: ContainerDeploymentStrategyType

  @IsOptional()
  customHeaders?: UniqueKey[]

  proxyHeaders: boolean

  useLoadBalancer: boolean

  @IsOptional()
  extraLBAnnotations?: UniqueKeyValue[]

  @IsOptional()
  healthCheckConfig?: ContainerConfigHealthCheck

  @IsOptional()
  resourceConfig?: ContainerConfigResourceConfig

  @IsOptional()
  annotations?: Marker

  @IsOptional()
  labels?: Marker
}
