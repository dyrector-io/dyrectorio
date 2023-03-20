import { Injectable } from '@nestjs/common'
import { Token } from '@prisma/client'
import { BasicToken } from './token.dto'

@Injectable()
export default class TokenMapper {
  listItemToDto(token: Token): BasicToken {
    return {
      ...token,
    }
  }

  generateResponseToDto(prismaToken: Token, jwt: string) {
    return {
      ...this.listItemToDto(prismaToken),
      token: jwt,
    }
  }
}
