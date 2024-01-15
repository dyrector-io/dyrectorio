import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { RegistryTokenPayload } from 'src/domain/registry-token'
import { CruxUnauthorizedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'

export const REGISTRY_HOOK_STRATEGY = 'registry-hook-strategy'

@Injectable()
export class RegistryJwtStrategy extends PassportStrategy(Strategy, REGISTRY_HOOK_STRATEGY) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    })
  }

  async validate(payload: RegistryTokenPayload): Promise<RegistryTokenPayload> {
    const token = await this.prisma.registryToken.findFirst({
      select: {
        id: true,
      },
      where: {
        nonce: payload.nonce,
        registryId: payload.registryId,
      },
    })

    // Validate that the user has not revoked the token.
    if (!token) {
      throw new CruxUnauthorizedException()
    }

    return payload
  }
}
