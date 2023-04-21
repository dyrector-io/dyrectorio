import { WebSocketGateway } from '@nestjs/websockets'
import { Identity } from '@ory/kratos-client'
import { WsAuthorize } from 'src/websockets/common'
import WsParam from 'src/websockets/decorators/ws.param.decorator'
import { IdentityFromSocket } from '../token/jwt-auth.guard'
import ImageService from './image.service'

const ImageId = () => WsParam('imageId')

@WebSocketGateway({
  // todo gateway namespace first part into a map
  namespace: 'images/:imageId',
})
export default class ImageWebSocketGateway {
  constructor(private readonly service: ImageService) {}

  @WsAuthorize()
  async onAuthorize(@ImageId() imageId: string, @IdentityFromSocket() identity: Identity): Promise<boolean> {
    // TODO(@m8vago): implement
    return true
  }
}
