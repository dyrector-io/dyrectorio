import { Type } from 'class-transformer'
import { IsBoolean, IsDate, IsIn, IsNumber, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'
import { ContainerConfigDto, PartialContainerConfigDto } from '../container/container.dto'
import { BasicRegistryDto } from '../registry/registry.dto'
import { ENVIRONMENT_VALUE_TYPES, EnvironmentValueType } from 'src/domain/image'

export class EnvironmentRule {
  @IsIn(ENVIRONMENT_VALUE_TYPES)
  type: EnvironmentValueType

  @IsBoolean()
  @IsOptional()
  required?: boolean

  @IsOptional()
  @IsString()
  default?: string
}

export class ImageValidation {
  @IsObject()
  environmentRules: Record<string, EnvironmentRule>
}

export class ImageDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  @IsOptional()
  tag?: string | null

  @IsNumber()
  order: number

  @ValidateNested()
  config: ContainerConfigDto

  @Type(() => Date)
  @IsDate()
  createdAt: Date

  @Type(() => BasicRegistryDto)
  registry: BasicRegistryDto

  @ValidateNested()
  validation: ImageValidation
}

export class AddImagesDto {
  @IsUUID()
  registryId: string

  @IsString({ each: true })
  images: string[]
}

export class PatchImageDto {
  @IsString()
  @IsOptional()
  tag?: string | null

  @IsOptional()
  @ValidateNested()
  config?: PartialContainerConfigDto | null
}
