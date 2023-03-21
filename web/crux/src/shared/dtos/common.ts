import { IsNotEmpty, IsUUID } from 'class-validator'

export default class IdDto {
  @IsUUID()
  @IsNotEmpty()
  id: string
}
