import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { GatewayMetadata } from '@nestjs/websockets'
import { GATEWAY_OPTIONS } from '@nestjs/websockets/constants'
import { Observable, of } from 'rxjs'
import TeamService from 'src/app/team/team.service'
import { identityOfSocket } from 'src/app/token/jwt-auth.guard'
import { CruxNotFoundException, CruxUnauthorizedException } from 'src/exception/crux-exception'
import {
  SubscriptionMessage,
  SubscriptionRedirectMessage,
  WS_TYPE_SUBSCRIBE,
  WS_TYPE_SUB_REDIRECT,
  WsMessage,
  ensurePathFormat,
} from 'src/websockets/common'

@Injectable()
export default class WsRedirectInterceptor implements NestInterceptor {
  constructor(private readonly teamService: TeamService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<WsMessage>> {
    const wsContext = context.switchToWs()
    const message: WsMessage = wsContext.getData()
    const gwOptions: GatewayMetadata & { redirectFrom: string } = Reflect.getMetadata(
      GATEWAY_OPTIONS,
      context.getClass(),
    )
    if (!gwOptions) {
      const errorMsg = `GatewayOptions not found for ${context.getClass().name}`
      throw new Error(errorMsg)
    }

    if (!gwOptions.redirectFrom) {
      const errorMsg = `Missing redirectFrom in GatewayOptions for ${context.getClass().name}`
      throw new Error(errorMsg)
    }

    const path = ensurePathFormat(gwOptions.redirectFrom)

    if (message.type !== WS_TYPE_SUBSCRIBE) {
      return next.handle()
    }

    const subMsg = message as WsMessage<SubscriptionMessage>
    if (ensurePathFormat(subMsg.data.path) !== path) {
      return next.handle()
    }

    const identity = identityOfSocket(context)
    if (!identity) {
      throw new CruxUnauthorizedException()
    }

    const meta = await this.teamService.getUserMeta(identity)
    if (!meta.activeTeamId) {
      throw new CruxNotFoundException({
        message: 'Active team not found.',
        property: 'activeTeam',
      })
    }

    const redirect: WsMessage<SubscriptionRedirectMessage> = {
      type: WS_TYPE_SUB_REDIRECT,
      data: {
        path,
        redirect: `/teams/${meta.activeTeamId}${path}`,
      },
    }

    return of(redirect)
  }
}
