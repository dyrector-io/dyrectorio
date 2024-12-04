import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { Identity } from '@ory/kratos-client'
import { takeUntil } from 'rxjs'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import { WsAuthorize, WsClient, WsMessage, WsSubscribe, WsSubscription, WsUnsubscribe } from 'src/websockets/common'
import SocketClient from 'src/websockets/decorators/ws.client.decorator'
import {
  UseGlobalWsFilters,
  UseGlobalWsGuards,
  UseGlobalWsInterceptors,
} from 'src/websockets/decorators/ws.gateway.decorators'
import WsParam from 'src/websockets/decorators/ws.param.decorator'
import SocketMessage from 'src/websockets/decorators/ws.socket-message.decorator'
import SocketSubscription from 'src/websockets/decorators/ws.subscription.decorator'
import { WS_TYPE_PATCH_RECEIVED } from '../container/container-config.message'
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
import ImageService from '../image/image.service'
import { IdentityFromSocket } from '../token/jwt-auth.guard'
import {
  AddImagesMessage,
  DeleteImageMessage,
  GetImageMessage,
  ImageDeletedMessage,
  ImageMessage,
  ImageTagMessage,
  OrderImagesMessage,
  WS_TYPE_ADD_IMAGES,
  WS_TYPE_DELETE_IMAGE,
  WS_TYPE_GET_IMAGE,
  WS_TYPE_IMAGE,
  WS_TYPE_IMAGES_WERE_REORDERED,
  WS_TYPE_IMAGE_DELETED,
  WS_TYPE_IMAGE_TAG_UPDATED,
  WS_TYPE_ORDER_IMAGES,
  WS_TYPE_SET_IMAGE_TAG,
} from './version.message'
import VersionService from './version.service'

const VersionId = () => WsParam('versionId')
const TeamSlug = () => WsParam('teamSlug')

@WebSocketGateway({
  namespace: ':teamSlug/projects/:projectId/versions/:versionId',
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
  async onAuthorize(
    @TeamSlug() teamSlug,
    @VersionId() versionId: string,
    @IdentityFromSocket() identity: Identity,
  ): Promise<boolean> {
    return await this.service.checkVersionIsInTeam(teamSlug, versionId, identity)
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

    this.service
      .subscribeToDomainEvents(versionId)
      .pipe(takeUntil(subscription.getCompleter(client.token)))
      .subscribe(message => subscription.sendToAll(message))

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

  @AuditLogLevel('disabled')
  @SubscribeMessage(WS_TYPE_GET_IMAGE)
  async getImage(@SocketMessage() message: GetImageMessage): Promise<WsMessage<ImageMessage>> {
    const data = await this.imageService.getImageDetails(message.id)

    return {
      type: WS_TYPE_IMAGE,
      data,
    } as WsMessage<ImageMessage>
  }

  @SubscribeMessage(WS_TYPE_ADD_IMAGES)
  async addImages(
    @TeamSlug() teamSlug: string,
    @VersionId() versionId: string,
    @SocketMessage() message: AddImagesMessage,
    @IdentityFromSocket() identity: Identity,
  ): Promise<void> {
    await this.imageService.addImagesToVersion(teamSlug, versionId, message.registryImages, identity)
  }

  @SubscribeMessage(WS_TYPE_DELETE_IMAGE)
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

  @SubscribeMessage(WS_TYPE_SET_IMAGE_TAG)
  async setImageTag(
    @TeamSlug() teamSlug,
    @SocketClient() client: WsClient,
    @SocketMessage() message: ImageTagMessage,
    @IdentityFromSocket() identity: Identity,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<WsMessage<null>> {
    await this.imageService.patchImage(
      teamSlug,
      message.imageId,
      {
        tag: message.tag,
      },
      identity,
    )

    const res: WsMessage<ImageTagMessage> = {
      type: WS_TYPE_IMAGE_TAG_UPDATED,
      data: message,
    }

    subscription.sendToAllExcept(client, res)

    return {
      type: WS_TYPE_PATCH_RECEIVED,
      data: null,
    }
  }

  @SubscribeMessage(WS_TYPE_ORDER_IMAGES)
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

  @AuditLogLevel('disabled')
  @SubscribeMessage(WS_TYPE_FOCUS_INPUT)
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

  @AuditLogLevel('disabled')
  @SubscribeMessage(WS_TYPE_BLUR_INPUT)
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
