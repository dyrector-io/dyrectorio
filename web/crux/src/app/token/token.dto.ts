import { Type } from 'class-transformer'
import { IsDate, IsInt, IsJWT, IsString, IsUUID, Min } from 'class-validator'

export class TokenDto {
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

export class GenerateTokenDto {
  @IsString()
  name: string

  @IsInt()
  @Min(1)
  expirationInDays: number
}

export class GeneratedTokenDto extends TokenDto {
  @IsJWT()
  token: string
}
