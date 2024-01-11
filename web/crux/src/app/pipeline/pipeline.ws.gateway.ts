import { WebSocketGateway } from '@nestjs/websockets'
import { Identity } from '@ory/kratos-client'
import { Observable, concatAll, from, map } from 'rxjs'
import { WsAuthorize, WsMessage, WsSubscribe, WsUnsubscribe } from 'src/websockets/common'
import {
  UseGlobalWsFilters,
  UseGlobalWsGuards,
  UseGlobalWsInterceptors,
} from 'src/websockets/decorators/ws.gateway.decorators'
import WsParam from 'src/websockets/decorators/ws.param.decorator'
import TeamRepository from '../team/team.repository'
import { IdentityFromSocket } from '../token/jwt-auth.guard'
import { PipelineStatusMessage, WS_TYPE_PIPELINE_STATUS } from './pipeline.message'
import PipelineRunStateService from './pipeline.run-state.service'
import PipelineService from './pipeline.service'

const TeamSlug = () => WsParam('teamSlug')

@WebSocketGateway({
  namespace: ':teamSlug/pipelines',
})
@UseGlobalWsFilters()
@UseGlobalWsGuards()
@UseGlobalWsInterceptors()
export default class PipelineWebSocketGateway {
  constructor(
    private readonly service: PipelineService,
    private readonly runStateService: PipelineRunStateService,
    private readonly teamRepository: TeamRepository,
  ) {}

  @WsAuthorize()
  async onAuthorize(@TeamSlug() teamSlug, @IdentityFromSocket() identity: Identity): Promise<boolean> {
    return await this.teamRepository.userIsInTeam(teamSlug, identity.id)
  }

  @WsSubscribe()
  onSubscribe(@TeamSlug() teamSlug): Observable<WsMessage<PipelineStatusMessage>> {
    return from(this.runStateService.onUserJoined(teamSlug)).pipe(
      concatAll(),
      map(it => ({
        type: WS_TYPE_PIPELINE_STATUS,
        data: it,
      })),
    )
  }

  @WsUnsubscribe()
  async onUnsubscribe(@TeamSlug() teamSlug: string): Promise<void> {
    await this.runStateService.onUserLeft(teamSlug)
  }
}
