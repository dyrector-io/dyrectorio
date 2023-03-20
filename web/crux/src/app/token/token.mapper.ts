import { Injectable } from '@nestjs/common'
import { Token as PrismaToken } from '@prisma/client'
import { Token } from './token.dto'

@Injectable()
export default class TokenMapper {
  listItemToDto(token: PrismaToken): Token {
    return {
      ...token,
    }
  }

  generateResponseToDto(prismaToken: PrismaToken, jwt: string) {
    return {
      ...this.listItemToDto(prismaToken),
      token: jwt,
    }
  }
}
