import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { Identity } from '@ory/kratos-client'
import { Observable, Subject, map, of, takeUntil } from 'rxjs'
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
import { IdentityFromSocket } from '../token/jwt-auth.guard'
import { ImageDeletedMessage, WS_TYPE_IMAGE_DELETED } from '../version/version.message'
import { PatchDeploymentDto, PatchInstanceDto } from './deploy.dto'
import {
  DeploymentEventListMessage,
  DeploymentEventMessage,
  GetInstanceMessage,
  GetInstanceSecretsMessage,
  InstanceMessage,
  InstanceSecretsMessage,
  InstanceUpdatedMessage,
  InstancesAddedMessage,
  PatchDeploymentEnvMessage,
  PatchInstanceMessage,
  WS_TYPE_DEPLOYMENT_ENV_UPDATED,
  WS_TYPE_DEPLOYMENT_EVENT_LIST,
  WS_TYPE_FETCH_DEPLOYMENT_EVENTS,
  WS_TYPE_GET_INSTANCE,
  WS_TYPE_GET_INSTANCE_SECRETS,
  WS_TYPE_INSTANCE,
  WS_TYPE_INSTANCES_ADDED,
  WS_TYPE_INSTANCE_SECRETS,
  WS_TYPE_INSTANCE_UPDATED,
  WS_TYPE_PATCH_DEPLOYMENT_ENV,
  WS_TYPE_PATCH_INSTANCE,
  WS_TYPE_PATCH_RECEIVED,
} from './deploy.message'
import DeployService from './deploy.service'

const DeploymentId = () => WsParam('deploymentId')

@WebSocketGateway({
  namespace: 'deployments/:deploymentId',
})
@UseGlobalWsFilters()
@UseGlobalWsGuards()
@UseGlobalWsInterceptors()
export default class DeployWebSocketGateway {
  private deploymentEventCompleters = new Map<string, Subject<unknown>>()

  constructor(private readonly service: DeployService, private readonly editorServices: EditorServiceProvider) {}

  @WsAuthorize()
  async onAuthorize(@DeploymentId() deploymentId: string, @IdentityFromSocket() identity: Identity): Promise<boolean> {
    return await this.service.checkDeploymentIsInTheActiveTeam(deploymentId, identity)
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

    const key = `${client.token}-${deploymentId}`
    if (this.deploymentEventCompleters.has(key)) {
      this.deploymentEventCompleters.get(key).next(undefined)
      this.deploymentEventCompleters.delete(key)
    }

    const completer = new Subject<unknown>()
    this.deploymentEventCompleters.set(key, completer)

    this.service
      .subscribeToDeploymentEditEvents(deploymentId)
      .pipe(takeUntil(completer))
      .subscribe(event => {
        if (event.type === 'create' && event.instances) {
          subscription.sendToAll({
            type: WS_TYPE_INSTANCES_ADDED,
            data: event.instances.filter(it => it.deploymentId === deploymentId),
          } as WsMessage<InstancesAddedMessage>)
        } else if (event.type === 'delete') {
          subscription.sendToAll({
            type: WS_TYPE_IMAGE_DELETED,
            data: {
              imageId: event.imageId,
            },
          } as WsMessage<ImageDeletedMessage>)
        }
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
    @DeploymentId() deploymentId: string,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<void> {
    const data = await this.service.onEditorLeft(deploymentId, client.token)
    const message: WsMessage<EditorLeftMessage> = {
      type: WS_TYPE_EDITOR_LEFT,
      data,
    }
    subscription.sendToAllExcept(client, message)

    const key = `${client.token}-${deploymentId}`
    if (this.deploymentEventCompleters.has(key)) {
      this.deploymentEventCompleters.get(key).next(undefined)
      this.deploymentEventCompleters.delete(key)
    }
  }

  @SubscribeMessage(WS_TYPE_FETCH_DEPLOYMENT_EVENTS)
  async fetchEvents(
    @DeploymentId() deploymentId: string,
  ): Promise<Observable<WsMessage<DeploymentEventListMessage> | WsMessage<DeploymentEventMessage>>> {
    const deployment = await this.service.getDeploymentDetails(deploymentId)
    const deploymentEvents = await this.service.getDeploymentEvents(deploymentId)

    if (deployment.status !== 'in-progress') {
      return of({
        type: WS_TYPE_DEPLOYMENT_EVENT_LIST,
        data: deploymentEvents,
      } as WsMessage<DeploymentEventListMessage>)
    }

    const observable = await this.service.subscribeToDeploymentEvents(deploymentId)

    return observable.pipe(
      map(it => {
        const msg: WsMessage<DeploymentEventListMessage> = {
          type: WS_TYPE_DEPLOYMENT_EVENT_LIST,
          data: it,
        }

        return msg
      }),
    )
  }

  @SubscribeMessage(WS_TYPE_PATCH_INSTANCE)
  async patchInstance(
    @DeploymentId() deploymentId: string,
    @SocketMessage() message: PatchInstanceMessage,
    @IdentityFromSocket() identity: Identity,
    @SocketClient() client: WsClient,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<WsMessage<null>> {
    const cruxReq: Pick<PatchInstanceDto, 'config'> = {
      config: {},
    }

    if (message.resetSection) {
      cruxReq.config[message.resetSection as string] = null
    } else {
      cruxReq.config = message.config
    }

    await this.service.patchInstance(deploymentId, message.instanceId, cruxReq, identity)

    subscription.sendToAllExcept(client, {
      type: WS_TYPE_INSTANCE_UPDATED,
      data: {
        instanceId: message.instanceId,
        ...message.config,
      },
    } as WsMessage<InstanceUpdatedMessage>)

    return {
      type: WS_TYPE_PATCH_RECEIVED,
      data: null,
    }
  }

  @SubscribeMessage(WS_TYPE_PATCH_DEPLOYMENT_ENV)
  async patchDeploymentEnvironment(
    @DeploymentId() deploymentId: string,
    @SocketMessage() message: PatchDeploymentEnvMessage,
    @IdentityFromSocket() identity: Identity,
    @SocketClient() client: WsClient,
    @SocketSubscription() subscription: WsSubscription,
  ): Promise<WsMessage<null>> {
    const cruxReq: PatchDeploymentDto = {
      environment: message,
    }

    await this.service.patchDeployment(deploymentId, cruxReq, identity)

    subscription.sendToAllExcept(client, {
      type: WS_TYPE_DEPLOYMENT_ENV_UPDATED,
      data: message,
    } as WsMessage<any>)

    return {
      type: WS_TYPE_PATCH_RECEIVED,
      data: null,
    }
  }

  @SubscribeMessage(WS_TYPE_GET_INSTANCE)
  async getInstance(@SocketMessage() message: GetInstanceMessage): Promise<WsMessage<InstanceMessage>> {
    const instance = await this.service.getInstance(message.id)

    return {
      type: WS_TYPE_INSTANCE,
      data: instance,
    }
  }

  @SubscribeMessage(WS_TYPE_GET_INSTANCE_SECRETS)
  async getInstanceSecrets(
    @SocketMessage() message: GetInstanceSecretsMessage,
  ): Promise<WsMessage<InstanceSecretsMessage>> {
    const secrets = await this.service.getInstanceSecrets(message.id)

    return {
      type: WS_TYPE_INSTANCE_SECRETS,
      data: {
        instanceId: message.id,
        keys: secrets.keys ?? [],
      },
    }
  }

  @SubscribeMessage(WS_TYPE_FOCUS_INPUT)
  @AuditLogLevel('disabled')
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

  @SubscribeMessage(WS_TYPE_BLUR_INPUT)
  @AuditLogLevel('disabled')
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
