import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { NotFoundException, InvalidArgumentException } from 'src/exception/errors'
import {
  AccessRequest,
  GenerateTokenRequest,
  GenerateTokenResponse,
  IdRequest,
  TokenListResponse,
} from 'src/grpc/protobuf/proto/crux'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import { AuthPayload } from 'src/shared/models'
import TokenMapper from './token.mapper'

@Injectable()
export default class AuthService {
  private logger = new Logger(AuthService.name)

  constructor(
    private jwtService: JwtService,
    private kratosService: KratosService,
    private prisma: PrismaService,
    private mapper: TokenMapper,
  ) {}

  async generateToken(req: GenerateTokenRequest): Promise<GenerateTokenResponse> {
    const user = await this.kratosService.getIdentityById(req.accessedBy)

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        property: 'accessedBy',
        value: req.accessedBy,
      })
    }

    if (req.expirationInDays <= 0) {
      throw new InvalidArgumentException({
        property: 'expirationInDays',
        value: req.expirationInDays,
        message: `Expiration cannot be zero or negative`,
      })
    }

    const payload: AuthPayload = { sub: user.id, email: user.traits.email, role: user.traits.role }

    const expirationDate = new Date(Date.now())
    expirationDate.setDate(expirationDate.getDate() + req.expirationInDays)
    this.logger.verbose(`Token expires at ${expirationDate.toISOString()}`)

    const newToken = await this.prisma.token.create({
      data: {
        userId: user.id,
        name: req.name,
        expiresAt: expirationDate,
      },
    })

    const jwt = this.jwtService.sign({ exp: expirationDate.getTime() / 1000, data: payload })

    return this.mapper.generateResponseToGrpc(newToken, jwt)
  }

  async getTokens(req: AccessRequest): Promise<TokenListResponse> {
    const response = await this.prisma.token.findMany({
      where: {
        userId: req.accessedBy,
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
