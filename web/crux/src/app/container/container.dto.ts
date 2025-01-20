import { ApiProperty, OmitType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import {
  CONTAINER_DEPLOYMENT_STRATEGY_VALUES,
  CONTAINER_EXPOSE_STRATEGY_VALUES,
  CONTAINER_LOG_DRIVER_VALUES,
  CONTAINER_NETWORK_MODE_VALUES,
  CONTAINER_RESTART_POLICY_TYPE_VALUES,
  CONTAINER_STATE_VALUES,
  CONTAINER_VOLUME_TYPE_VALUES,
  ContainerDeploymentStrategyType,
  ContainerExposeStrategy,
  ContainerLogDriverType,
  ContainerNetworkMode,
  ContainerRestartPolicyType,
  ContainerState,
  ContainerVolumeType,
  PORT_MAX,
  PORT_MIN,
} from 'src/domain/container'
import { UID_MAX, UID_MIN } from 'src/shared/const'
import { ConfigBundleDto } from '../config.bundle/config.bundle.dto'
import { DeploymentWithConfigDto } from '../deploy/deploy.dto'
import { ImageDto } from '../image/image.dto'
import { BasicProjectDto } from '../project/project.dto'
import { BasicVersionDto } from '../version/version.dto'
import { ContainerConfigProperty } from './container.const'

export const CONTAINER_CONFIG_TYPE_VALUES = ['image', 'instance', 'deployment', 'config-bundle'] as const
export type ContainerConfigTypeDto = (typeof CONTAINER_CONFIG_TYPE_VALUES)[number]

export class UniqueKeyDto {
  @IsUUID()
  id: string

  @IsString()
  key: string
}

export class UniqueKeyValueDto extends UniqueKeyDto {
  @IsString()
  value: string
}

export class UniqueSecretKeyDto extends UniqueKeyDto {
  @IsBoolean()
  required: boolean
}

export class UniqueSecretKeyValueDto extends UniqueSecretKeyDto {
  @IsString()
  value: string

  @IsBoolean()
  encrypted: boolean

  @IsString()
  @IsOptional()
  publicKey?: string
}

export class ContainerConfigRoutingDto {
  @IsString()
  @IsOptional()
  domain?: string

  @IsString()
  @IsOptional()
  path?: string

  @IsBoolean()
  @IsOptional()
  stripPath?: boolean

  @IsString()
  @IsOptional()
  uploadLimit?: string

  @IsInt()
  @IsOptional()
  @Min(PORT_MIN)
  @Max(PORT_MAX)
  port?: number
}

export class ConfigContainerDto {
  @IsString()
  image: string

  @IsString()
  volume: string

  @IsString()
  path: string

  @IsBoolean()
  keepFiles: boolean
}

export class PortDto {
  @IsUUID()
  id: string

  @IsInt()
  @Min(PORT_MIN)
  @Max(PORT_MAX)
  internal: number

  @IsInt()
  @Min(PORT_MIN)
  @Max(PORT_MAX)
  @IsOptional()
  external?: number
}

class PortRangeDto {
  @IsInt()
  @Min(PORT_MIN)
  @Max(PORT_MAX)
  from: number

  @IsInt()
  @Min(PORT_MIN)
  @Max(PORT_MAX)
  to: number
}

export class ContainerConfigPortRangeDto {
  @IsUUID()
  id: string

  @ValidateNested()
  internal: PortRangeDto

  @ValidateNested()
  external: PortRangeDto
}

export class VolumeDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  path: string

  @IsString()
  @IsOptional()
  size?: string

  @ApiProperty({ enum: CONTAINER_VOLUME_TYPE_VALUES })
  @IsIn(CONTAINER_VOLUME_TYPE_VALUES)
  @IsOptional()
  type?: ContainerVolumeType

  @IsString()
  @IsOptional()
  class?: string
}

class InitContainerVolumeLinkDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  path: string
}

export class InitContainerDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  image: string

  @ValidateNested({ each: true })
  command: UniqueKeyDto[]

  @ValidateNested({ each: true })
  args: UniqueKeyDto[]

  @ValidateNested({ each: true })
  environment: UniqueKeyValueDto[]

  @IsBoolean()
  useParentConfig: boolean

  @ValidateNested({ each: true })
  volumes: InitContainerVolumeLinkDto[]
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

export class LogDto {
  @ApiProperty({ enum: CONTAINER_LOG_DRIVER_VALUES })
  @IsIn(CONTAINER_LOG_DRIVER_VALUES)
  driver: ContainerLogDriverType

  @ValidateNested({ each: true })
  options: UniqueKeyValueDto[]
}

export class HealthCheckDto {
  @Min(PORT_MIN)
  @Max(PORT_MAX)
  @IsInt()
  @IsOptional()
  port?: number

  @IsString()
  @IsOptional()
  livenessProbe?: string

  @IsString()
  @IsOptional()
  readinessProbe?: string

  @IsString()
  @IsOptional()
  startupProbe?: string
}

class ResourceDto {
  @IsString()
  @IsOptional()
  cpu?: string

  @IsString()
  @IsOptional()
  memory?: string
}

export class ResourceConfigDto {
  @ValidateNested()
  @IsOptional()
  limits?: ResourceDto

  @ValidateNested()
  @IsOptional()
  requests?: ResourceDto
}

export class MarkerDto {
  @IsOptional()
  @ValidateNested({ each: true })
  service?: UniqueKeyValueDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  deployment?: UniqueKeyValueDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  ingress?: UniqueKeyValueDto[]
}

export class MetricsDto {
  @IsBoolean()
  enabled: boolean

  @IsOptional()
  @IsString()
  path?: string

  @IsOptional()
  @IsNumber()
  port?: number
}

export class ExpectedContainerStateDto {
  @ApiProperty({ enum: CONTAINER_STATE_VALUES })
  @IsIn(CONTAINER_STATE_VALUES)
  state: ContainerState

  @IsOptional()
  @IsNumber()
  timeout?: number

  @IsOptional()
  @IsNumber()
  exitCode?: number
}

export class ContainerConfigDto {
  @IsString()
  id: string

  @ApiProperty({ enum: CONTAINER_CONFIG_TYPE_VALUES })
  @IsIn(CONTAINER_CONFIG_TYPE_VALUES)
  @IsOptional()
  type: ContainerConfigTypeDto

  // common
  @IsString()
  @IsOptional()
  name?: string

  @IsOptional()
  @ValidateNested({ each: true })
  environment?: UniqueKeyValueDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  secrets?: UniqueSecretKeyDto[]

  @IsOptional()
  @ValidateNested()
  routing?: ContainerConfigRoutingDto

  @ApiProperty({ enum: CONTAINER_EXPOSE_STRATEGY_VALUES })
  @IsIn(CONTAINER_EXPOSE_STRATEGY_VALUES)
  @IsOptional()
  expose?: ContainerExposeStrategy

  @IsOptional()
  @IsInt()
  @Min(UID_MIN)
  @Max(UID_MAX)
  user?: number

  @IsOptional()
  @IsString()
  workingDirectory?: string

  @IsBoolean()
  @IsOptional()
  tty?: boolean

  @IsOptional()
  @ValidateNested()
  configContainer?: ConfigContainerDto

  @IsOptional()
  @ValidateNested({ each: true })
  ports?: PortDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  portRanges?: ContainerConfigPortRangeDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  volumes?: VolumeDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  commands?: UniqueKeyDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  args?: UniqueKeyDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  initContainers?: InitContainerDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  capabilities?: UniqueKeyValueDto[]

  @IsOptional()
  @ValidateNested()
  storage?: ContainerStorageDto

  // dagent
  @IsOptional()
  @ValidateNested()
  logConfig?: LogDto

  @ApiProperty({ enum: CONTAINER_RESTART_POLICY_TYPE_VALUES })
  @IsIn(CONTAINER_RESTART_POLICY_TYPE_VALUES)
  @IsOptional()
  restartPolicy?: ContainerRestartPolicyType

  @ApiProperty({ enum: CONTAINER_NETWORK_MODE_VALUES })
  @IsIn(CONTAINER_NETWORK_MODE_VALUES)
  @IsOptional()
  networkMode?: ContainerNetworkMode

  @IsOptional()
  @ValidateNested({ each: true })
  networks?: UniqueKeyDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  dockerLabels?: UniqueKeyValueDto[]

  @IsOptional()
  @ValidateNested()
  expectedState?: ExpectedContainerStateDto

  // crane
  @ApiProperty({ enum: CONTAINER_DEPLOYMENT_STRATEGY_VALUES })
  @IsIn(CONTAINER_DEPLOYMENT_STRATEGY_VALUES)
  @IsOptional()
  deploymentStrategy?: ContainerDeploymentStrategyType

  @IsOptional()
  @ValidateNested({ each: true })
  customHeaders?: UniqueKeyDto[]

  @IsBoolean()
  @IsOptional()
  proxyHeaders?: boolean

  @IsBoolean()
  @IsOptional()
  useLoadBalancer?: boolean

  @IsOptional()
  @ValidateNested({ each: true })
  extraLBAnnotations?: UniqueKeyValueDto[]

  @IsOptional()
  @ValidateNested()
  healthCheckConfig?: HealthCheckDto

  @IsOptional()
  @ValidateNested()
  resourceConfig?: ResourceConfigDto

  @IsOptional()
  @ValidateNested()
  annotations?: MarkerDto

  @IsOptional()
  @ValidateNested()
  labels?: MarkerDto

  @IsOptional()
  @ValidateNested()
  metrics?: MetricsDto
}

export class ContainerConfigRelationsDto {
  @ValidateNested()
  @IsOptional()
  project?: BasicProjectDto

  @ValidateNested()
  @IsOptional()
  version?: BasicVersionDto

  @ValidateNested()
  @IsOptional()
  image?: ImageDto

  @ValidateNested()
  @IsOptional()
  deployment?: DeploymentWithConfigDto

  @ValidateNested()
  @IsOptional()
  configBundle?: ConfigBundleDto
}

export class ContainerConfigParentDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsBoolean()
  mutable: boolean
}

export class ContainerConfigDetailsDto extends ContainerConfigDto {
  @ValidateNested()
  parent: ContainerConfigParentDto

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  updatedAt?: Date

  @IsString()
  @IsOptional()
  updatedBy?: string
}

export class ContainerConfigDataDto extends OmitType(ContainerConfigDto, ['id', 'type']) {}

export class PatchContainerConfigDto {
  @IsOptional()
  @ValidateNested()
  config?: ContainerConfigDataDto

  @IsOptional()
  @IsString()
  resetSection?: ContainerConfigProperty
}

export class ConcreteContainerConfigDto extends OmitType(ContainerConfigDto, ['secrets']) {
  @IsOptional()
  @ValidateNested({ each: true })
  secrets?: UniqueSecretKeyValueDto[]
}

export class ConcreteContainerConfigDataDto extends OmitType(ConcreteContainerConfigDto, ['id', 'type']) {}

export class ContainerIdentifierDto {
  @IsString()
  prefix: string

  @IsString()
  name: string
}

export class ContainerSecretsDto {
  @IsString()
  publicKey: string

  @IsString({ each: true })
  keys: string[]
}
