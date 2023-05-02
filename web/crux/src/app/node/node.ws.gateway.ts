import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common'
import { WebSocketGateway } from '@nestjs/websockets'
import { Identity } from '@ory/kratos-client'
import { Observable, from, map, mergeAll } from 'rxjs'
import WsExceptionFilter from 'src/filters/ws.exception-filter'
import { WsAuthorize, WsMessage, WsSubscribe } from 'src/websockets/common'
import WsParam from 'src/websockets/decorators/ws.param.decorator'
import WsRedirectInterceptor from 'src/websockets/interceptors/ws.redirect.interceptor'
import TeamService from '../team/team.service'
import JwtAuthGuard, { IdentityFromSocket } from '../token/jwt-auth.guard'
import { NodeEventMessage, WS_TYPE_NODE_EVENT } from './node.message'
import NodeService from './node.service'

const TeamId = () => WsParam('teamId')

@WebSocketGateway({
  namespace: 'teams/:teamId/nodes',
  redirectFrom: '/nodes',
})
@UseFilters(WsExceptionFilter)
@UseGuards(JwtAuthGuard)
@UseInterceptors(WsRedirectInterceptor)
export default class NodeWebSocketGateway {
  constructor(private readonly service: NodeService, private readonly teamService: TeamService) {}

  @WsAuthorize()
  async onAuthorize(@TeamId() teamId: string, @IdentityFromSocket() identity: Identity): Promise<boolean> {
    return await this.teamService.checkUserActiveTeam(teamId, identity)
  }

  @WsSubscribe()
  onSubscribe(@TeamId() teamId: string): Observable<WsMessage> {
    return from(this.service.subscribeToNodeEvents(teamId)).pipe(
      mergeAll(),
      map(it => {
        const msg: WsMessage<NodeEventMessage> = {
          type: WS_TYPE_NODE_EVENT,
          data: it,
        }
        return msg
      }),
    )
  }
}
