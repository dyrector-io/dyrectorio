/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */
import { ContainerConfigData } from 'src/shared/models'
import { BasicRegistryDto } from '../registry/registry.dto'

export class ImageDto {
  id: string
  name: string
  tag: string
  order: number
  config: ContainerConfigData
  createdAt: Date
  registry: BasicRegistryDto
}
