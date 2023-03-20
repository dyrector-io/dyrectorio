import { Type } from 'class-transformer'
import { IsDate } from 'class-validator'

export class BasicToken {
  id: string

  name: string

  @Type(() => Date)
  @IsDate()
  expiresAt: Date

  @Type(() => Date)
  @IsDate()
  createdAt: Date
}

export class TokenList {
  data: BasicToken[]
}

export class GenerateToken {
  name: string

  expirationInDays: number
}

export class Token extends BasicToken {
  token: string
}
