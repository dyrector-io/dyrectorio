import { Type } from 'class-transformer'
import { IsDate, IsNumber, IsString, IsUUID } from 'class-validator'
import { ContainerConfigData } from 'src/shared/models'
import { BasicRegistryDto } from '../registry/registry.dto'

export default class ImageDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  tag: string

  @IsNumber()
  order: number

  // TODO (@polaroi8d): Missing the DTO in the validator
  config: ContainerConfigData

  @Type(() => Date)
  @IsDate()
  createdAt: Date

  @Type(() => BasicRegistryDto)
  registry: BasicRegistryDto
}
