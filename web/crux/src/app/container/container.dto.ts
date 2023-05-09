import { ApiProperty, PartialType } from '@nestjs/swagger'
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
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
  CONTAINER_VOLUME_TYPE_VALUES,
  ContainerDeploymentStrategyType,
  ContainerExposeStrategy,
  ContainerLogDriverType,
  ContainerNetworkMode,
  ContainerRestartPolicyType,
  ContainerVolumeType,
  PORT_MAX,
  PORT_MIN,
} from 'src/domain/container'

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

export class ContainerConfigIngressDto {
  @IsString()
  name: string

  @IsString()
  host: string

  @IsString()
  @IsOptional()
  uploadLimit?: string
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

export class ContainerConfigDto {
  // common
  @IsString()
  name: string

  @IsOptional()
  @ValidateNested({ each: true })
  environment?: UniqueKeyValueDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  secrets?: UniqueSecretKeyDto[]

  @IsOptional()
  @ValidateNested()
  ingress?: ContainerConfigIngressDto

  @ApiProperty({ enum: CONTAINER_EXPOSE_STRATEGY_VALUES })
  @IsIn(CONTAINER_EXPOSE_STRATEGY_VALUES)
  expose: ContainerExposeStrategy

  @IsOptional()
  @IsInt()
  @IsPositive()
  user?: number

  @IsBoolean()
  tty: boolean

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
  restartPolicy: ContainerRestartPolicyType

  @ApiProperty({ enum: CONTAINER_NETWORK_MODE_VALUES })
  @IsIn(CONTAINER_NETWORK_MODE_VALUES)
  networkMode: ContainerNetworkMode

  @IsOptional()
  @ValidateNested({ each: true })
  networks?: UniqueKeyDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  dockerLabels?: UniqueKeyValueDto[]

  // crane
  @ApiProperty({ enum: CONTAINER_DEPLOYMENT_STRATEGY_VALUES })
  @IsIn(CONTAINER_DEPLOYMENT_STRATEGY_VALUES)
  deploymentStrategy: ContainerDeploymentStrategyType

  @IsOptional()
  @ValidateNested({ each: true })
  customHeaders?: UniqueKeyDto[]

  @IsBoolean()
  proxyHeaders: boolean

  @IsBoolean()
  useLoadBalancer: boolean

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
}

export class PartialContainerConfigDto extends PartialType(ContainerConfigDto) {}
