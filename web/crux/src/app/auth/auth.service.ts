import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { NotFoundException } from 'src/exception/errors'
import { TokenRequest, TokenResponse } from 'src/grpc/protobuf/proto/crux'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import { AuthPayload } from 'src/shared/models'

@Injectable()
export default class AuthService {
  private logger = new Logger(AuthService.name)

  constructor(private jwtService: JwtService, private kratosService: KratosService, private prisma: PrismaService) {}

  async generateToken(request: TokenRequest): Promise<TokenResponse> {
    const user = await this.kratosService.getIdentityById(request.accessedBy)

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        property: 'accessedBy',
        value: request.accessedBy,
      })
    }

    const payload: AuthPayload = { sub: user.id, email: user.traits.email, role: user.traits.role }

    const expirationDate = new Date(Date.now())
    expirationDate.setDate(expirationDate.getDate() + request.expirationInsDays)
    this.logger.verbose(`Token expires at ${expirationDate.toISOString()}`)

    await this.prisma.token.create({
      data: {
        userId: user.id,
        name: request.name,
        expiresAt: expirationDate,
      },
    })

    return {
      token: this.jwtService.sign({ exp: expirationDate.getTime() / 1000, data: payload }),
    }
  }

  async getUserTokens(request: AccessRequest): Promise<> {
    const response = await this.prisma.token.findMany({
      where: {
        userId: request.accessedBy,
      },
    })

    // TODO Implement this
    return response
  }
}
