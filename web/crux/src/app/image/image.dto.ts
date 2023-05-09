import { Type } from 'class-transformer'
import { IsDate, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'
import { ContainerConfigDto, PartialContainerConfigDto } from '../container/container.dto'
import { BasicRegistryDto } from '../registry/registry.dto'

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
