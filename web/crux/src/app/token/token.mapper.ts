import { Injectable } from '@nestjs/common'
import { Token } from '@prisma/client'
import { SimpleToken } from './token.dto'

@Injectable()
export default class TokenMapper {
  listItemToDto(token: Token): SimpleToken {
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
