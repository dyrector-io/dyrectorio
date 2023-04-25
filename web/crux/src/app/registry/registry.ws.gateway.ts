import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import JwtAuthGuard, { IdentityFromSocket } from '../token/jwt-auth.guard'
import { Identity } from '@ory/kratos-client'
import { WsAuthorize, WsMessage } from 'src/websockets/common'
import { RegistryConnections } from './registry-api/registry-connections'
import { IMAGE_FILTER_TAKE } from './registry.const'
import { FetchImageTagsMessage, FindImageMessage, FindImageResultMessage, RegistryImageTagsMessage } from './registry.message'
import { UseGuards } from '@nestjs/common'

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
  async findImage(@MessageBody() message: WsMessage<FindImageMessage>, @IdentityFromSocket() identity: Identity): Promise<WsMessage<FindImageResultMessage>> {
    const req = message.data
    const api = await this.connections.getByRegistryId(req.registryId, identity)
    const images = await api.catalog(req.filter, IMAGE_FILTER_TAKE)

    return {
      type: 'find-image-result',
      data: {
        registryId: req.registryId,
        images: images.map(it => ({
          id: '',
          name: it,
          tags: 0,
        })),
      },
    } as WsMessage<FindImageResultMessage>
  }

  @SubscribeMessage('fetch-image-tags')
  async fetchImageTags(@MessageBody() message: WsMessage<FetchImageTagsMessage>, @IdentityFromSocket() identity: Identity): Promise<WsMessage<RegistryImageTagsMessage>> {
    const req = message.data
    const api = await this.connections.getByRegistryId(req.registryId, identity)
    const tags = req.images.map(it => api.tags(it))

    return {
      type: 'registry-image-tags',
      data: {
        registryId: req.registryId,
        images: await Promise.all(tags)
      },
    } as WsMessage<RegistryImageTagsMessage>
  }
}
