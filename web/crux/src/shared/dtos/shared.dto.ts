import { IsString } from 'class-validator'

export type BasicProperties = 'id' | 'name' | 'type'

export class ContainerIdentifierDto {
  @IsString()
  prefix: string

  @IsString()
  name: string
}
