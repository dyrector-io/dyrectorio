import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, of } from 'rxjs'
import TeamService from 'src/app/team/team.service'
import { identityOfSocket } from 'src/app/token/jwt-auth.guard'
import {
  SubscriptionMessage,
  SubscriptionRedirectMessage,
  WS_TYPE_SUBSCRIBE,
  WS_TYPE_SUB_REDIRECT,
  WsMessage,
  ensurePathFormat,
} from 'src/websockets/common'

@Injectable()
export default class NodeWsRedirectInterceptor implements NestInterceptor {
  constructor(private readonly teamService: TeamService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<WsMessage>> {
    const wsContext = context.switchToWs()
    const message: WsMessage = wsContext.getData()

    if (message.type !== WS_TYPE_SUBSCRIBE) {
      return next.handle()
    }

    const subMsg = message as WsMessage<SubscriptionMessage>
    if (ensurePathFormat(subMsg.data.path) !== '/nodes') {
      return next.handle()
    }

    const identity = identityOfSocket(context)
    if (!identity) {
      // TODO(@m8vago): return dyo error
      // handle jwt
      // throw error
      return null
    }

    const meta = await this.teamService.getUserMeta(identity)
    if (!meta.activeTeamId) {
      // TODO(@m8vago): return dyo error
      // throw error
      return null
    }

    const redirect: WsMessage<SubscriptionRedirectMessage> = {
      type: WS_TYPE_SUB_REDIRECT,
      data: {
        path: '/nodes',
        redirect: `/teams/${meta.activeTeamId}/nodes`,
      },
    }

    return of(redirect)
  }
}
