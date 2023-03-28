import { IsString } from 'class-validator'
import { BasicNodeDto } from '../shared/shared.dto'

// eslint-disable-next-line import/prefer-default-export
export class NodeDto extends BasicNodeDto {
  @IsString()
  address: string

  @IsString()
  version: string
}
