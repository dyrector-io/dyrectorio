import { Type } from 'class-transformer'
import { IsDate, IsNumber, IsString, IsUUID } from 'class-validator'
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
  registryId: string

  images: string[]
}

export class PatchImageDto {
  tag?: string

  config?: Partial<ContainerConfigDto>
}

export class ContainerStorageDto {
  storageId?: string

  path?: string

  bucket?: string
}

export class ContainerConfigDto {
  // common
  name: string

  environment?: UniqueKeyValue[]

  secrets?: UniqueSecretKey[]

  ingress?: ContainerConfigIngress

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

  restartPolicy: ContainerRestartPolicyType

  networkMode: ContainerNetworkMode

  networks?: UniqueKey[]

  dockerLabels?: UniqueKeyValue[]

  // crane
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
