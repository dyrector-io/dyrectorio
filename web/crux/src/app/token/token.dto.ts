import { Type } from 'class-transformer'
import { IsDate, IsInt, IsJWT, IsString, IsUUID, Min } from 'class-validator'

export class Token {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @Type(() => Date)
  @IsDate()
  expiresAt: Date

  @Type(() => Date)
  @IsDate()
  createdAt: Date
}

export class GenerateToken {
  @IsString()
  name: string

  @IsInt()
  @Min(1)
  expirationInDays: number
}

export class GeneratedToken extends Token {
  @IsJWT()
  token: string
}
