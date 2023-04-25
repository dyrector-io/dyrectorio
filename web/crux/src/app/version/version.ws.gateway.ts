import { UseGuards } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { WsAuthorize, WsMessage } from 'src/websockets/common'
import WsParam from 'src/websockets/decorators/ws.param.decorator'
import JwtAuthGuard, { IdentityFromSocket } from '../token/jwt-auth.guard'
import VersionService from './version.service'
import { AddImagesMessage, DeleteImageMessage, GetImageMessage, ImageDeletedMessage, ImageMessage, ImagesAddedMessage, OrderImagesMessage, PatchImageMessage, WS_TYPE_ADD_IMAGES, WS_TYPE_DELETE_IMAGE, WS_TYPE_GET_IMAGE, WS_TYPE_IMAGE, WS_TYPE_IMAGES_ADDED, WS_TYPE_IMAGE_DELETED, WS_TYPE_ORDER_IMAGES, WS_TYPE_PATCH_IMAGE, WS_TYPE_PATCH_RECEIVED } from './version.message'
import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import ImageService from '../image/image.service'
import { PatchImageDto } from '../image/image.dto'

const VersionId = () => WsParam('versionId')

@WebSocketGateway({
  namespace: 'versions/:versionId',
})
@UseGuards(JwtAuthGuard)
export default class VersionWebSocketGateway {
  constructor(private readonly service: VersionService, private readonly imageService: ImageService) {}

  @WsAuthorize()
  async onAuthorize(@VersionId() versionId: string, @IdentityFromSocket() identity: Identity): Promise<boolean> {
    // TODO(@robot9706): implement
    //return await this.teamService.checkUserActiveTeam(teamId, identity)
    return true
  }

  @SubscribeMessage(WS_TYPE_GET_IMAGE)
  async getImage(@MessageBody() message: WsMessage<GetImageMessage>): Promise<WsMessage<ImageMessage>> {
    const data = await this.imageService.getImageDetails(message.data.id)

    return {
      type: WS_TYPE_IMAGE,
      data,
    } as WsMessage<ImageMessage>
  }

  @SubscribeMessage(WS_TYPE_ADD_IMAGES)
  async addImages(@VersionId() versionId: string, @MessageBody() message: WsMessage<AddImagesMessage>, @IdentityFromSocket() identity: Identity): Promise<WsMessage<ImagesAddedMessage>> {
    const images = await this.imageService.addImagesToVersion(versionId, message.data.registryImages, identity)

    return {
      type: WS_TYPE_IMAGES_ADDED,
      data: {
        images,
      },
    }
  }

  @SubscribeMessage(WS_TYPE_DELETE_IMAGE)
  async deleteImage(@MessageBody() message: WsMessage<DeleteImageMessage>): Promise<WsMessage<ImageDeletedMessage>> {
    await this.imageService.deleteImage(message.data.imageId)

    // editors.onDeleteItem(req.imageId)

    return {
      type: WS_TYPE_IMAGE_DELETED,
      data: {
        imageId: message.data.imageId,
      },
    }
  }

  @SubscribeMessage(WS_TYPE_PATCH_IMAGE)
  async patchImage(@MessageBody() message: WsMessage<PatchImageMessage>, @IdentityFromSocket() identity: Identity): Promise<WsMessage<unknown>> {
    const req = message.data
    let cruxReq: Pick<PatchImageDto, 'tag' | 'config'> = {}

    if (req.resetSection) {
      cruxReq.config = {}
      cruxReq.config[req.resetSection as string] = null
    } else {
      cruxReq = req
    }

    await this.imageService.patchImage(req.id, cruxReq, identity)

    /*
      endpoint.sendAllExcept(connection, WS_TYPE_IMAGE_UPDATED, {
        ...req,
      } as ImageUpdateMessage)
    */

    return {
      type: WS_TYPE_PATCH_RECEIVED,
      data: null,
    }
  }

  @SubscribeMessage(WS_TYPE_ORDER_IMAGES)
  async orderImages(@MessageBody() message: WsMessage<OrderImagesMessage>, @IdentityFromSocket() identity: Identity): Promise<void> {
    await this.imageService.orderImages(message.data, identity)

    // endpoint.sendAllExcept(connection, WS_TYPE_IMAGES_WERE_REORDERED, req as ImagesWereReorderedMessage)
  }
}
