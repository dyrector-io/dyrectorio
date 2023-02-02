import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APIAuthPayload } from 'src/shared/models'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService, private prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    })
  }

  /**
   * Validate returns jwt payload.
   * @params payload - is an object literal containing the decoded JWT payload
   * @params done - passport error first callback accepting arguments done(error, user, info)
   * @returns payload
   * @memberof JwtStrategy
   */
  async validate(payload: APIAuthPayload): Promise<APIAuthPayload> {
    const token = await this.prismaService.token.findFirst({
      select: {
        id: true,
      },
      where: {
        nonce: payload.nonce,
      },
    })

    // Validate that the user has not revoked the token.
    if (!token) {
      throw new UnauthorizedException()
    }

    return payload
  }
}
