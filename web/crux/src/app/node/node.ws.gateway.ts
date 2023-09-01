import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { Identity } from '@ory/kratos-client'
import { Observable, from, map, mergeAll } from 'rxjs'
import { WsAuthorize, WsMessage, WsSubscribe } from 'src/websockets/common'
import { UseGlobalWsFilters, UseGlobalWsGuards } from 'src/websockets/decorators/ws.gateway.decorators'
import WsParam from 'src/websockets/decorators/ws.param.decorator'
import SocketMessage from 'src/websockets/decorators/ws.socket-message.decorator'
import TeamRepository from '../team/team.repository'
import { IdentityFromSocket } from '../token/jwt-auth.guard'
import { NodeEventMessage, UpdateNodeMessage, WS_TYPE_NODE_EVENT } from './node.message'
import NodeService from './node.service'

const TeamSlug = () => WsParam('teamSlug')

@WebSocketGateway({
  namespace: ':teamSlug/nodes',
})
@UseGlobalWsFilters()
@UseGlobalWsGuards()
export default class NodeWebSocketGateway {
  constructor(
    private readonly service: NodeService,
    private readonly teamRepository: TeamRepository,
  ) {}

  @WsAuthorize()
  async onAuthorize(@TeamSlug() teamSlug: string, @IdentityFromSocket() identity: Identity): Promise<boolean> {
    return await this.teamRepository.userIsInTeam(teamSlug, identity.id)
  }

  @WsSubscribe()
  onSubscribe(@TeamSlug() teamSlug: string): Observable<WsMessage> {
    return from(this.service.subscribeToNodeEvents(teamSlug)).pipe(
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

  @SubscribeMessage('update-agent')
  updateAgent(@SocketMessage() message: UpdateNodeMessage, @IdentityFromSocket() identity: Identity) {
    this.service.updateAgent(message.id, identity)
  }
}
