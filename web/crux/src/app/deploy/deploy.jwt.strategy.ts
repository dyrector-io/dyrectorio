import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { DeploymentTokenPayload } from 'src/domain/deployment-token'
import { CruxUnauthorizedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'

export const DEPLOY_TOKEN_STRATEGY = 'deploy-token-strategy'

@Injectable()
export class DeployJwtStrategy extends PassportStrategy(Strategy, DEPLOY_TOKEN_STRATEGY) {
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

  async validate(payload: DeploymentTokenPayload): Promise<DeploymentTokenPayload> {
    const token = await this.prisma.deploymentToken.findFirst({
      select: {
        id: true,
      },
      where: {
        nonce: payload.nonce,
        deploymentId: payload.deploymentId,
      },
    })

    // Validate that the user has not revoked the token.
    if (!token) {
      throw new CruxUnauthorizedException()
    }

    return payload
  }
}
