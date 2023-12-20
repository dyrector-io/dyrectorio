import { OmitType } from '@nestjs/swagger'
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
  @IsBoolean()
  public: boolean

  @IsBoolean()
  inUse: boolean
}

export class StorageOptionDto {
  @IsUUID()
  id: string

  @IsString()
  name: string
}

export class CreateStorageDto extends OmitType(StorageDetailsDto, ['id', 'inUse']) {
  @IsString()
  @IsOptional()
  accessKey?: string

  @IsString()
  @IsOptional()
  secretKey?: string
}

export class UpdateStorageDto extends CreateStorageDto {}
