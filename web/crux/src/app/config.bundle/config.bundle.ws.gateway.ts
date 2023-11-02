import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { Identity } from '@ory/kratos-client'
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
import { PatchConfigBundleDto } from './config.bundle.dto'
import {
  ConfigBundleEnvUpdatedMessage,
  PatchConfigBundleEnvMessage,
  WS_TYPE_CONFIG_BUNDLE_UPDATED,
  WS_TYPE_PATCH_CONFIG_BUNDLE,
  WS_TYPE_PATCH_RECEIVED,
} from './config.bundle.message'
import ConfigBundleService from './config.bundle.service'

const TeamSlug = () => WsParam('teamSlug')
const ConfigBundleId = () => WsParam('configBundleId')

@WebSocketGateway({
  namespace: ':teamSlug/config-bundles/:configBundleId',
})
@UseGlobalWsFilters()
@UseGlobalWsGuards()
@UseGlobalWsInterceptors()
export default class ConfigBundleWebSocketGateway {
  constructor(
    private readonly service: ConfigBundleService,
    private readonly editorServices: EditorServiceProvider,
  ) {}

  @WsAuthorize()
  async onAuthorize(
    @TeamSlug() teamSlug: string,
    @ConfigBundleId() configBundleId: string,
    @IdentityFromSocket() identity: Identity,
  ): Promise<boolean> {
    return await this.service.checkConfigBundleIsInTeam(teamSlug, configBundleId, identity)
  }

  @WsSubscribe()
  async onSubscribe(
    @SocketClient() client: WsClient,
    @ConfigBundleId() configBundleId: string,
    @IdentityFromSocket() identity,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<WsMessage<EditorInitMessage>> {
    const [me, editors] = await this.service.onEditorJoined(configBundleId, client.token, identity)
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
    @ConfigBundleId() configBundleId: string,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<void> {
    const data = await this.service.onEditorLeft(configBundleId, client.token)
    const message: WsMessage<EditorLeftMessage> = {
      type: WS_TYPE_EDITOR_LEFT,
      data,
    }
    subscription.sendToAllExcept(client, message)
  }

  @SubscribeMessage(WS_TYPE_PATCH_CONFIG_BUNDLE)
  async patchConfigBundleEnvironment(
    @ConfigBundleId() configBundleId: string,
    @SocketMessage() message: PatchConfigBundleEnvMessage,
    @IdentityFromSocket() identity: Identity,
    @SocketClient() client: WsClient,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<WsMessage<null>> {
    const cruxReq: PatchConfigBundleDto = {
      ...message,
    }

    await this.service.patchConfigBundle(configBundleId, cruxReq, identity)

    subscription.sendToAllExcept(client, {
      type: WS_TYPE_CONFIG_BUNDLE_UPDATED,
      data: message,
    } as WsMessage<ConfigBundleEnvUpdatedMessage>)

    return {
      type: WS_TYPE_PATCH_RECEIVED,
      data: null,
    }
  }

  @AuditLogLevel('disabled')
  @SubscribeMessage(WS_TYPE_FOCUS_INPUT)
  async onFocusInput(
    @SocketClient() client: WsClient,
    @ConfigBundleId() configBundleId: string,
    @SocketMessage() message: InputFocusMessage,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<void> {
    const editors = await this.editorServices.getService(configBundleId)
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
    @ConfigBundleId() configBundleId: string,
    @SocketMessage() message: InputFocusMessage,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<void> {
    const editors = await this.editorServices.getService(configBundleId)
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
