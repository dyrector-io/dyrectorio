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
import { IdentityFromSocket } from '../token/jwt-auth.guard'
import { PatchConfigMessage, WS_TYPE_PATCH_CONFIG, WS_TYPE_PATCH_RECEIVED } from './container-config.message'
import ContainerConfigService from './container-config.service'

const TeamSlug = () => WsParam('teamSlug')
const ConfigId = () => WsParam('configId')

@WebSocketGateway({
  namespace: ':teamSlug/container-configurations/:configId',
})
@UseGlobalWsFilters()
@UseGlobalWsGuards()
@UseGlobalWsInterceptors()
export default class ContainerConfigWebSocketGateway {
  constructor(
    private readonly service: ContainerConfigService,
    private readonly editorServices: EditorServiceProvider,
  ) {}

  @WsAuthorize()
  async onAuthorize(
    @TeamSlug() teamSlug: string,
    @ConfigId() configId: string,
    @IdentityFromSocket() identity: Identity,
  ): Promise<boolean> {
    return await this.service.checkConfigIsInTeam(teamSlug, configId, identity)
  }

  @WsSubscribe()
  async onSubscribe(
    @SocketClient() client: WsClient,
    @ConfigId() configId: string,
    @IdentityFromSocket() identity,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<WsMessage<EditorInitMessage>> {
    const [me, editors] = await this.service.onEditorJoined(configId, client.token, identity)

    this.service
      .subscribeToDomainEvents(configId)
      .pipe(takeUntil(subscription.getCompleter(client.token)))
      .subscribe(message => subscription.sendToAll(message))

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
    @ConfigId() configId: string,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<void> {
    const data = await this.service.onEditorLeft(configId, client.token)
    const message: WsMessage<EditorLeftMessage> = {
      type: WS_TYPE_EDITOR_LEFT,
      data,
    }

    subscription.sendToAllExcept(client, message)
  }

  @SubscribeMessage(WS_TYPE_PATCH_CONFIG)
  async patchConfig(
    @ConfigId() configId: string,
    @SocketMessage() message: PatchConfigMessage,
    @IdentityFromSocket() identity: Identity,
  ): Promise<WsMessage<null>> {
    await this.service.patchConfig(configId, message, identity)

    return {
      type: WS_TYPE_PATCH_RECEIVED,
      data: null,
    }
  }

  @AuditLogLevel('disabled')
  @SubscribeMessage(WS_TYPE_FOCUS_INPUT)
  async onFocusInput(
    @SocketClient() client: WsClient,
    @ConfigId() configId: string,
    @SocketMessage() message: InputFocusMessage,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<void> {
    const editors = await this.editorServices.getService(configId)
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
    @ConfigId() configId: string,
    @SocketMessage() message: InputFocusMessage,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<void> {
    const editors = await this.editorServices.getService(configId)
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
