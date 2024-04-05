import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Identity } from '@ory/kratos-client'
import { JwtTokenPayload, tokenSignOptionsFor } from 'src/domain/token'
import PrismaService from 'src/services/prisma.service'
import { v4 as uuid } from 'uuid'
import { GenerateTokenDto, GeneratedTokenDto, TokenDto } from './token.dto'
import TokenMapper from './token.mapper'

@Injectable()
export default class TokenService {
  private logger = new Logger(TokenService.name)

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mapper: TokenMapper,
  ) {}

  async generateToken(req: GenerateTokenDto, identity: Identity): Promise<GeneratedTokenDto> {
    const nonce = uuid()
    const expirationDate = req.expirationInDays === 0 ? null : TokenService.getExpirationDate(req.expirationInDays)
    this.logger.verbose(expirationDate ? `Token expires at ${expirationDate.toISOString()}` : 'Token never expries')

    const payload: JwtTokenPayload = {
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

    const jwt = this.jwtService.sign(payload, tokenSignOptionsFor(identity, expirationDate))

    return this.mapper.generatedTokenToDto(newToken, jwt)
  }

  async getTokenList(identity: Identity): Promise<TokenDto[]> {
    const response = await this.prisma.token.findMany({
      where: {
        userId: identity.id,
      },
    })

    return response.map(it => this.mapper.toDto(it))
  }

  async getToken(id: string, identity: Identity): Promise<TokenDto> {
    const response = await this.prisma.token.findFirst({
      where: {
        userId: identity.id,
        id,
      },
    })

    return this.mapper.toDto(response)
  }

  async deleteToken(id: string): Promise<void> {
    await this.prisma.token.delete({
      where: {
        id,
      },
    })
  }

  private static getExpirationDate(days: number): Date {
    const expirationDate = new Date(Date.now())
    expirationDate.setDate(expirationDate.getDate() + days)
    return expirationDate
  }
}
