import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthPayload } from 'src/domain/identity'
import { CruxUnauthorizedException } from 'src/exception/crux-exception'
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
  async validate(payload: AuthPayload): Promise<AuthPayload> {
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
      throw new CruxUnauthorizedException()
    }

    return payload
  }
}
