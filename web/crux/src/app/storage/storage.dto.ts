import { IsBoolean, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator'

export class BasicStorageDto {
  @IsUUID()
  id: string

  @IsString()
  name: string
}

export class StorageDto extends BasicStorageDto {
  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  icon?: string

  @IsUrl()
  url: string
}

export class StorageDetailsDto extends StorageDto {
  @IsString()
  @IsOptional()
  accessKey?: string

  @IsString()
  @IsOptional()
  secretKey?: string

  @IsBoolean()
  inUse: boolean
}

export class StorageOptionDto {
  @IsUUID()
  id: string

  @IsString()
  name: string
}

export class CreateStorageDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  icon?: string

  @IsUrl()
  url: string

  @IsString()
  @IsOptional()
  accessKey?: string

  @IsString()
  @IsOptional()
  secretKey?: string
}

export class UpdateStorageDto extends CreateStorageDto {}
