import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'
import { UniqueKeyValueDto } from '../container/container.dto'

class BasicConfigBundleDto {
  @IsUUID()
  id: string

  @IsString()
  name: string
}

export class ConfigBundleDto extends BasicConfigBundleDto {
  @IsString()
  @IsOptional()
  description?: string
}

export class ConfigBundleDetailsDto extends ConfigBundleDto {
  @ValidateNested({ each: true })
  environment: UniqueKeyValueDto[]
}

export class CreateConfigBundleDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string
}

export class PatchConfigBundleDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  description?: string

  @ValidateNested({ each: true })
  @IsOptional()
  environment?: UniqueKeyValueDto[]
}

export class ConfigBundleOptionDto extends BasicConfigBundleDto {}
