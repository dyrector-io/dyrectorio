import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AzureHook } from 'src/domain/pipeline'
import { PipelineTokenPayload } from 'src/domain/pipeline-token'
import { CruxUnauthorizedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'

export const PIPELINE_TOKEN_STRATEGY = 'pipeline-token-strategy'

@Injectable()
export class PipelineJwtStrategy extends PassportStrategy(Strategy, PIPELINE_TOKEN_STRATEGY) {
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

  async validate(payload: PipelineTokenPayload): Promise<PipelineTokenPayload> {
    const pipeline = await this.prisma.pipeline.findFirst({
      select: {
        hooks: true,
      },
      where: {
        id: payload.sub,
      },
    })

    const hooks: AzureHook[] = (pipeline?.hooks as AzureHook[]) ?? []

    // validate if there is a hook with that nonce
    if (!hooks.find(it => it.nonce === payload.nonce)) {
      throw new CruxUnauthorizedException()
    }

    return payload
  }
}
