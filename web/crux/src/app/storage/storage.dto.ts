import { IsString, IsUrl } from 'class-validator'

export class StorageDto {
  id: string

  name: string

  description?: string

  icon?: string

  url: string
}

export class StorageDetailsDto extends StorageDto {
  accessKey?: string

  secretKey?: string

  inUse: boolean
}

export class StorageOptionDto {
  id: string

  name: string
}

export class CreateStorageDto {
  @IsString()
  name: string

  @IsString()
  description?: string

  @IsString()
  icon?: string

  @IsUrl()
  url: string

  @IsString()
  accessKey?: string

  @IsString()
  secretKey?: string
}

export class UpdateStorageDto extends CreateStorageDto {}
