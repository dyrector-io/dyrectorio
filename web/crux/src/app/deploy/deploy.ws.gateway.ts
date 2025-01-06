import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { Identity } from '@ory/kratos-client'
import { Observable, map, of, startWith, takeUntil } from 'rxjs'
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
import {
  DeploymentEventListMessage,
  DeploymentEventMessage,
  WS_TYPE_DEPLOYMENT_EVENT_LIST,
  WS_TYPE_FETCH_DEPLOYMENT_EVENTS,
} from './deploy.message'
import DeployService from './deploy.service'

const TeamSlug = () => WsParam('teamSlug')
const DeploymentId = () => WsParam('deploymentId')

@WebSocketGateway({
  namespace: ':teamSlug/deployments/:deploymentId',
})
@UseGlobalWsFilters()
@UseGlobalWsGuards()
@UseGlobalWsInterceptors()
export default class DeployWebSocketGateway {
  constructor(
    private readonly service: DeployService,
    private readonly editorServices: EditorServiceProvider,
  ) {}

  @WsAuthorize()
  async onAuthorize(
    @TeamSlug() teamSlug: string,
    @DeploymentId() deploymentId: string,
    @IdentityFromSocket() identity: Identity,
  ): Promise<boolean> {
    return await this.service.checkDeploymentIsInTeam(teamSlug, deploymentId, identity)
  }

  @WsSubscribe()
  async onSubscribe(
    @SocketClient() client: WsClient,
    @DeploymentId() deploymentId: string,
    @IdentityFromSocket() identity,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<WsMessage<EditorInitMessage>> {
    const [me, editors] = await this.service.onEditorJoined(deploymentId, client.token, identity)
    subscription.sendToAllExcept(client, {
      type: WS_TYPE_EDITOR_JOINED,
      data: me,
    })

    this.service
      .subscribeToDomainEvents(deploymentId)
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
    @DeploymentId() deploymentId: string,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<void> {
    const data = await this.service.onEditorLeft(deploymentId, client.token)

    const message: WsMessage<EditorLeftMessage> = {
      type: WS_TYPE_EDITOR_LEFT,
      data,
    }
    subscription.sendToAllExcept(client, message)
  }

  @AuditLogLevel('disabled')
  @SubscribeMessage(WS_TYPE_FETCH_DEPLOYMENT_EVENTS)
  async fetchEvents(
    @DeploymentId() deploymentId: string,
  ): Promise<Observable<WsMessage<DeploymentEventListMessage> | WsMessage<DeploymentEventMessage>>> {
    const deployment = await this.service.getDeploymentDetails(deploymentId)

    if (deployment.status !== 'in-progress') {
      const deploymentEvents = await this.service.getDeploymentEvents(deploymentId)

      return of({
        type: WS_TYPE_DEPLOYMENT_EVENT_LIST,
        data: deploymentEvents,
      } as WsMessage<DeploymentEventListMessage>)
    }

    const currentEvents = await this.service.getDeploymentEvents(deploymentId, deployment.lastTry)
    const observable = await this.service.subscribeToDeploymentEvents(deploymentId)

    return observable.pipe(
      startWith(currentEvents),
      map(it => {
        const msg: WsMessage<DeploymentEventListMessage> = {
          type: WS_TYPE_DEPLOYMENT_EVENT_LIST,
          data: it,
        }

        return msg
      }),
    )
  }

  @AuditLogLevel('disabled')
  @SubscribeMessage(WS_TYPE_FOCUS_INPUT)
  async onFocusInput(
    @SocketClient() client: WsClient,
    @DeploymentId() deploymentId: string,
    @SocketMessage() message: InputFocusMessage,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<void> {
    const editors = await this.editorServices.getService(deploymentId)
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
    @DeploymentId() deploymentId: string,
    @SocketMessage() message: InputFocusMessage,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<void> {
    const editors = await this.editorServices.getService(deploymentId)
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
