import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'
import { UniqueKeyValueDto } from '../container/container.dto'

export class BasicConfigBundleDto {
  @IsUUID()
  id: string

  @IsString()
  name: string
}

export class ConfigBundleDto extends BasicConfigBundleDto {}

export class ConfigBundleDetailsDto extends BasicConfigBundleDto {
  @ValidateNested({ each: true })
  environment: UniqueKeyValueDto[]
}

export class CreateConfigBundleDto {
  @IsString()
  name: string
}

export class PatchConfigBundleDto {
  @IsString()
  @IsOptional()
  name?: string

  @ValidateNested({ each: true })
  @IsOptional()
  environment?: UniqueKeyValueDto[]
}

export class ConfigBundleOptionDto extends BasicConfigBundleDto {}
