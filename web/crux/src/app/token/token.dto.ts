import { Type } from 'class-transformer'
import { IsDate, IsDefined, IsJWT, IsString, IsUUID, Validate } from 'class-validator'
import IsTokenExpiration from './validation/token-expiration.validator'

export type TokenExpiration = number | 'never'

export class TokenDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @Type(() => Date)
  @IsDate()
  expiresAt?: Date

  @Type(() => Date)
  @IsDate()
  createdAt: Date
}

export class GenerateTokenDto {
  @IsString()
  name: string

  @IsDefined()
  @Validate(IsTokenExpiration)
  expirationInDays: TokenExpiration
}

export class GeneratedTokenDto extends TokenDto {
  @IsJWT()
  token: string
}
