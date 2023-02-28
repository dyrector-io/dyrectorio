import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Identity } from '@ory/kratos-client'
import { GenerateTokenRequest, GenerateTokenResponse, IdRequest, TokenListResponse } from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'
import { AuthPayload } from 'src/shared/models'
import { v4 as uuid } from 'uuid'
import TokenMapper from './token.mapper'

@Injectable()
export default class AuthService {
  private logger = new Logger(AuthService.name)

  constructor(private jwtService: JwtService, private prisma: PrismaService, private mapper: TokenMapper) {}

  async generateToken(req: GenerateTokenRequest, identity: Identity): Promise<GenerateTokenResponse> {
    const nonce = uuid()
    const expirationDate = new Date(Date.now())
    expirationDate.setDate(expirationDate.getDate() + req.expirationInDays)
    this.logger.verbose(`Token expires at ${expirationDate.toISOString()}`)

    const payload: AuthPayload = {
      sub: identity.id,
      nonce,
    }

    const newToken = await this.prisma.token.create({
      data: {
        userId: identity.id,
        name: req.name,
        expiresAt: expirationDate,
        nonce,
      },
    })

    const jwt = this.jwtService.sign({ exp: expirationDate.getTime() / 1000, data: payload })

    return this.mapper.generateResponseToGrpc(newToken, jwt)
  }

  async getTokenList(identity: Identity): Promise<TokenListResponse> {
    const response = await this.prisma.token.findMany({
      where: {
        userId: identity.id,
      },
    })

    return {
      data: response.map(it => this.mapper.toGrpc(it)),
    }
  }

  async deleteToken(req: IdRequest): Promise<void> {
    await this.prisma.token.delete({
      where: {
        id: req.id,
      },
    })
  }
}
