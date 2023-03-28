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
  storageId?: string

  @IsString()
  path?: string

  @IsString()
  bucket?: string
}

export class ContainerConfigDto {
  // common
  name: string

  environment?: UniqueKeyValue[]

  secrets?: UniqueSecretKey[]

  ingress?: ContainerConfigIngress

  @ApiProperty({
    enum: CONTAINER_EXPOSE_STRATEGY_VALUES,
  })
  expose: ContainerConfigExposeStrategy

  user?: number

  tty: boolean

  configContainer?: ContainerConfigContainer

  ports?: ContainerConfigPort[]

  portRanges?: ContainerConfigPortRange[]

  volumes?: ContainerConfigVolume[]

  commands?: UniqueKey[]

  args?: UniqueKey[]

  initContainers?: InitContainer[]

  capabilities: UniqueKeyValue[]

  storage?: ContainerStorageDto

  // dagent
  logConfig?: ContainerConfigLog

  @ApiProperty({
    enum: CONTAINER_RESTART_POLICY_TYPE_VALUES,
  })
  restartPolicy: ContainerRestartPolicyType

  @ApiProperty({
    enum: CONTAINER_NETWORK_MODE_VALUES,
  })
  networkMode: ContainerNetworkMode

  networks?: UniqueKey[]

  dockerLabels?: UniqueKeyValue[]

  // crane
  @ApiProperty({
    enum: CONTAINER_DEPLOYMENT_STRATEGY_VALUES,
  })
  deploymentStrategy: ContainerDeploymentStrategyType

  customHeaders?: UniqueKey[]

  proxyHeaders: boolean

  useLoadBalancer: boolean

  extraLBAnnotations?: UniqueKeyValue[]

  healthCheckConfig?: ContainerConfigHealthCheck

  resourceConfig?: ContainerConfigResourceConfig

  annotations?: Marker

  labels?: Marker
}
