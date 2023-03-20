import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Identity } from '@ory/kratos-client'
import PrismaService from 'src/services/prisma.service'
import { AuthPayload } from 'src/shared/models'
import { v4 as uuid } from 'uuid'
import { GenerateToken, SimpleToken, Token, TokenList } from './token.dto'
import TokenMapper from './token.mapper'

@Injectable()
export default class TokenService {
  private logger = new Logger(TokenService.name)

  constructor(private jwtService: JwtService, private prisma: PrismaService, private mapper: TokenMapper) {}

  async generateToken(req: GenerateToken, identity: Identity): Promise<Token> {
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

    return this.mapper.generateResponseToDto(newToken, jwt)
  }

  async getTokenList(identity: Identity): Promise<TokenList> {
    const response = await this.prisma.token.findMany({
      where: {
        userId: identity.id,
      },
    })

    return {
      data: response.map(it => this.mapper.listItemToDto(it)),
    }
  }

  async getToken(id: string, identity: Identity): Promise<SimpleToken> {
    const response = await this.prisma.token.findFirst({
      where: {
        userId: identity.id,
        id,
      },
    })

    return this.mapper.listItemToDto(response)
  }

  async deleteToken(id: string): Promise<void> {
    await this.prisma.token.delete({
      where: {
        id,
      },
    })
  }
}
