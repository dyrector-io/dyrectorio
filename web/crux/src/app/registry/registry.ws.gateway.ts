import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { Identity } from '@ory/kratos-client'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import RegistryMetrics from 'src/shared/metrics/registry.metrics'
import { WsAuthorize, WsMessage } from 'src/websockets/common'
import { UseGlobalWsFilters, UseGlobalWsGuards } from 'src/websockets/decorators/ws.gateway.decorators'
import WsParam from 'src/websockets/decorators/ws.param.decorator'
import SocketMessage from 'src/websockets/decorators/ws.socket-message.decorator'
import TeamRepository from '../team/team.repository'
import { IdentityFromSocket } from '../token/jwt-auth.guard'
import RegistryClientProvider from './registry-client.provider'
import {
  FetchImageTagsMessage,
  FindImageMessage,
  FindImageResultMessage,
  RegistryImageTagsMessage,
  WS_TYPE_FETCH_IMAGE_TAGS,
  WS_TYPE_FIND_IMAGE,
  WS_TYPE_FIND_IMAGE_RESULT,
  WS_TYPE_REGISTRY_IMAGE_TAGS,
} from './registry.message'

const TeamSlug = () => WsParam('teamSlug')

const METRICS_CATALOG = 'catalog'
const METRICS_TAGS = 'tags'

@WebSocketGateway({
  namespace: ':teamSlug/registries',
})
@UseGlobalWsFilters()
@UseGlobalWsGuards()
export default class RegistryWebSocketGateway {
  constructor(
    private readonly registryClients: RegistryClientProvider,
    private readonly teamRepository: TeamRepository,
  ) {}

  @WsAuthorize()
  async onAuthorize(@TeamSlug() teamSlug: string, @IdentityFromSocket() identity: Identity): Promise<boolean> {
    return await this.teamRepository.userIsInTeam(teamSlug, identity.id)
  }

  @AuditLogLevel('disabled')
  @SubscribeMessage(WS_TYPE_FIND_IMAGE)
  async findImage(
    @TeamSlug() teamSlug: string,
    @SocketMessage() message: FindImageMessage,
  ): Promise<WsMessage<FindImageResultMessage>> {
    const teamId = await this.teamRepository.getTeamIdBySlug(teamSlug)

    const api = await this.registryClients.getByRegistryId(teamId, message.registryId)

    RegistryMetrics.apiRequest(api.type, METRICS_CATALOG).inc()
    const images = await api.client.catalog(message.filter)

    return {
      type: WS_TYPE_FIND_IMAGE_RESULT,
      data: {
        registryId: message.registryId,
        images: images.map(it => ({
          id: '',
          name: it,
          tags: 0,
        })),
      },
    } as WsMessage<FindImageResultMessage>
  }

  @AuditLogLevel('disabled')
  @SubscribeMessage(WS_TYPE_FETCH_IMAGE_TAGS)
  async fetchImageTags(
    @TeamSlug() teamSlug: string,
    @SocketMessage() message: FetchImageTagsMessage,
  ): Promise<WsMessage<RegistryImageTagsMessage>> {
    const teamId = await this.teamRepository.getTeamIdBySlug(teamSlug)

    const api = await this.registryClients.getByRegistryId(teamId, message.registryId)

    RegistryMetrics.apiRequest(api.type, METRICS_TAGS).inc()
    const tags = message.images.map(it => api.client.tags(it))

    return {
      type: WS_TYPE_REGISTRY_IMAGE_TAGS,
      data: {
        registryId: message.registryId,
        images: await Promise.all(tags),
      },
    } as WsMessage<RegistryImageTagsMessage>
  }
}
