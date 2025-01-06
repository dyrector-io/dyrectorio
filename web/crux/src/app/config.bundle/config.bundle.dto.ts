import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'
import { ContainerConfigDto } from '../container/container.dto'

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

  @IsUUID()
  configId: string
}

export class ConfigBundleDetailsDto extends ConfigBundleDto {
  @ValidateNested()
  config: ContainerConfigDto
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

  @ValidateNested()
  @IsOptional()
  config?: ContainerConfigDto
}

export class ConfigBundleOptionDto extends BasicConfigBundleDto {}
