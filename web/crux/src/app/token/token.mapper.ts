import { Injectable } from '@nestjs/common'
import { Token } from '@prisma/client'
import { GeneratedTokenDto, TokenDto } from './token.dto'

@Injectable()
export default class TokenMapper {
  toDto(token: Token): TokenDto {
    return {
      ...token,
    }
  }

  generatedTokenToDto(prismaToken: Token, jwt: string): GeneratedTokenDto {
    return {
      ...this.toDto(prismaToken),
      token: jwt,
    }
  }
}
