import { UseGuards } from '@nestjs/common'
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { Identity } from '@ory/kratos-client'
import { WsAuthorize, WsMessage } from 'src/websockets/common'
import SocketMessage from 'src/websockets/decorators/ws.socket-message.decorator'
import JwtAuthGuard, { IdentityFromSocket } from '../token/jwt-auth.guard'
import { RegistryConnections } from './registry-api/registry-connections'
import { IMAGE_FILTER_TAKE } from './registry.const'
import {
  FetchImageTagsMessage,
  FindImageMessage,
  FindImageResultMessage,
  RegistryImageTagsMessage,
} from './registry.message'

@WebSocketGateway({
  namespace: 'registries',
})
@UseGuards(JwtAuthGuard)
export default class RegistryWebSocketGateway {
  constructor(private readonly connections: RegistryConnections) {}

  // TODO(@robot9706): disconnect

  @WsAuthorize()
  async onAuthorize(@IdentityFromSocket() identity: Identity): Promise<boolean> {
    // TODO(@robot9706): implement
    return true
  }

  @SubscribeMessage('find-image')
  async findImage(
    @SocketMessage() message: FindImageMessage,
    @IdentityFromSocket() identity: Identity,
  ): Promise<WsMessage<FindImageResultMessage>> {
    const api = await this.connections.getByRegistryId(message.registryId, identity)
    const images = await api.catalog(message.filter, IMAGE_FILTER_TAKE)

    return {
      type: 'find-image-result',
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

  @SubscribeMessage('fetch-image-tags')
  async fetchImageTags(
    @SocketMessage() message: FetchImageTagsMessage,
    @IdentityFromSocket() identity: Identity,
  ): Promise<WsMessage<RegistryImageTagsMessage>> {
    const api = await this.connections.getByRegistryId(message.registryId, identity)
    const tags = message.images.map(it => api.tags(it))

    return {
      type: 'registry-image-tags',
      data: {
        registryId: message.registryId,
        images: await Promise.all(tags),
      },
    } as WsMessage<RegistryImageTagsMessage>
  }
}
