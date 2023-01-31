import { Injectable } from '@nestjs/common'
import { Token } from '@prisma/client'
import { toTimestamp } from 'src/domain/utils'
import { TokenResponse } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export default class TokenMapper {
  toGrpc(token: Token): TokenResponse {
    return {
      ...token,
      expiresAt: toTimestamp(token.expiresAt),
      createdAt: toTimestamp(token.createdAt),
    }
  }

  generateResponseToGrpc(prismaToken: Token, jwt: string) {
    return {
      ...this.toGrpc(prismaToken),
      token: jwt,
    }
  }
}
