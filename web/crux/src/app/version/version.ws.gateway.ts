import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { Identity } from '@ory/kratos-client'
import { WsAuthorize, WsClient, WsMessage, WsSubscribe, WsSubscription, WsUnsubscribe } from 'src/websockets/common'
import SocketClient from 'src/websockets/decorators/ws.client.decorator'
import WsParam from 'src/websockets/decorators/ws.param.decorator'
import SocketMessage from 'src/websockets/decorators/ws.socket-message.decorator'
import SocketSubscription from 'src/websockets/decorators/ws.subscription.decorator'
import {
  UseGlobalWsFilters,
  UseGlobalWsGuards,
  UseGlobalWsInterceptors,
} from 'src/websockets/decorators/ws.gateway.decorators'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import {
  EditorInitMessage,
  EditorLeftMessage,
  InputFocusChangeMessage,
  InputFocusMessage,
  WS_TYPE_BLUR_INPUT,
  WS_TYPE_EDITOR_INIT,
  WS_TYPE_EDITOR_JOINED,
  WS_TYPE_EDITOR_LEFT,
  WS_TYPE_FOCUS_INPUT,
  WS_TYPE_INPUT_BLURRED,
  WS_TYPE_INPUT_FOCUSED,
} from '../editor/editor.message'
import EditorServiceProvider from '../editor/editor.service.provider'
import { PatchImageDto } from '../image/image.dto'
import ImageService from '../image/image.service'
import { IdentityFromSocket } from '../token/jwt-auth.guard'
import {
  AddImagesMessage,
  DeleteImageMessage,
  GetImageMessage,
  ImageDeletedMessage,
  ImageMessage,
  ImagesAddedMessage,
  OrderImagesMessage,
  PatchImageMessage,
  WS_TYPE_IMAGE,
  WS_TYPE_IMAGES_ADDED,
  WS_TYPE_IMAGES_WERE_REORDERED,
  WS_TYPE_IMAGE_DELETED,
  WS_TYPE_IMAGE_UPDATED,
  WS_TYPE_PATCH_RECEIVED,
} from './version.message'
import VersionService from './version.service'

const VersionId = () => WsParam('versionId')

// TODO(@m8vago): make an event aggregator for image updates patches etc
// so subscribers will be notified of the changes regardless of the transport platform

@WebSocketGateway({
  namespace: 'versions/:versionId',
})
@UseGlobalWsFilters()
@UseGlobalWsGuards()
@UseGlobalWsInterceptors()
export default class VersionWebSocketGateway {
  constructor(
    private readonly service: VersionService,
    private readonly imageService: ImageService,
    private readonly editorServices: EditorServiceProvider,
  ) {}

  @WsAuthorize()
  async onAuthorize(@VersionId() versionId: string, @IdentityFromSocket() identity: Identity): Promise<boolean> {
    return await this.service.checkVersionIsInTheActiveTeam(versionId, identity)
  }

  @WsSubscribe()
  async onSubscribe(
    @SocketClient() client: WsClient,
    @VersionId() versionId: string,
    @IdentityFromSocket() identity,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<WsMessage<EditorInitMessage>> {
    const [me, editors] = await this.service.onEditorJoined(versionId, client.token, identity)
    subscription.sendToAllExcept(client, {
      type: WS_TYPE_EDITOR_JOINED,
      data: me,
    })

    return {
      type: WS_TYPE_EDITOR_INIT,
      data: {
        meId: me.id,
        editors,
      },
    }
  }

  @WsUnsubscribe()
  async onUnsubscribe(
    @SocketClient() client: WsClient,
    @VersionId() versionId: string,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<void> {
    const data = await this.service.onEditorLeft(versionId, client.token)
    const message: WsMessage<EditorLeftMessage> = {
      type: WS_TYPE_EDITOR_LEFT,
      data,
    }
    subscription.sendToAllExcept(client, message)
  }

  @SubscribeMessage('get-image')
  async getImage(@SocketMessage() message: GetImageMessage): Promise<WsMessage<ImageMessage>> {
    const data = await this.imageService.getImageDetails(message.id)

    return {
      type: WS_TYPE_IMAGE,
      data,
    } as WsMessage<ImageMessage>
  }

  @SubscribeMessage('add-images')
  async addImages(
    @VersionId() versionId: string,
    @SocketMessage() message: AddImagesMessage,
    @IdentityFromSocket() identity: Identity,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<void> {
    const images = await this.imageService.addImagesToVersion(versionId, message.registryImages, identity)

    const res: WsMessage<ImagesAddedMessage> = {
      type: WS_TYPE_IMAGES_ADDED,
      data: {
        images,
      },
    }

    subscription.sendToAll(res)
  }

  @SubscribeMessage('delete-image')
  async deleteImage(
    @SocketMessage() message: DeleteImageMessage,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<void> {
    await this.imageService.deleteImage(message.imageId)

    const res: WsMessage<ImageDeletedMessage> = {
      type: WS_TYPE_IMAGE_DELETED,
      data: message,
    }

    subscription.sendToAll(res)
  }

  @SubscribeMessage('patch-image')
  async patchImage(
    @SocketClient() client: WsClient,
    @SocketMessage() message: PatchImageMessage,
    @IdentityFromSocket() identity: Identity,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<WsMessage<null>> {
    let cruxReq: Pick<PatchImageDto, 'tag' | 'config'> = {}

    if (message.resetSection) {
      cruxReq.config = {}
      cruxReq.config[message.resetSection as string] = null
    } else {
      cruxReq = message
    }

    await this.imageService.patchImage(message.id, cruxReq, identity)

    const res: WsMessage<PatchImageMessage> = {
      type: WS_TYPE_IMAGE_UPDATED,
      data: message,
    }

    subscription.sendToAllExcept(client, res)

    return {
      type: WS_TYPE_PATCH_RECEIVED,
      data: null,
    }
  }

  @SubscribeMessage('order-images')
  async orderImages(
    @SocketClient() client: WsClient,
    @SocketMessage() message: OrderImagesMessage,
    @IdentityFromSocket() identity: Identity,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<void> {
    await this.imageService.orderImages(message, identity)

    const res: WsMessage<OrderImagesMessage> = {
      type: WS_TYPE_IMAGES_WERE_REORDERED,
      data: message,
    }

    subscription.sendToAllExcept(client, res)
  }

  @SubscribeMessage(WS_TYPE_FOCUS_INPUT)
  @AuditLogLevel('disabled')
  async onFocusInput(
    @SocketClient() client: WsClient,
    @VersionId() versionId: string,
    @SocketMessage() message: InputFocusMessage,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<void> {
    const editors = await this.editorServices.getService(versionId)
    if (!editors) {
      return
    }

    const data = editors.onFocus(client.token, message)

    const res: WsMessage<InputFocusChangeMessage> = {
      type: WS_TYPE_INPUT_FOCUSED,
      data,
    }

    subscription.sendToAllExcept(client, res)
  }

  @SubscribeMessage(WS_TYPE_BLUR_INPUT)
  @AuditLogLevel('disabled')
  async onBlurInput(
    @SocketClient() client: WsClient,
    @VersionId() versionId: string,
    @SocketMessage() message: InputFocusMessage,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<void> {
    const editors = await this.editorServices.getService(versionId)
    if (!editors) {
      return
    }

    const data = editors.onBlur(client.token, message)

    const res: WsMessage<InputFocusChangeMessage> = {
      type: WS_TYPE_INPUT_BLURRED,
      data,
    }

    subscription.sendToAllExcept(client, res)
  }
}
