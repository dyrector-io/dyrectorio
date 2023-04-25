import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { Identity } from '@ory/kratos-client'
import { WsAuthorize, WsMessage } from 'src/websockets/common'
import WsParam from 'src/websockets/decorators/ws.param.decorator'
import { IdentityFromSocket } from '../token/jwt-auth.guard'
import DeployService from './deploy.service'
import {
  DeploymentEventListMessage,
  DeploymentEventMessage,
  GetInstanceMessage,
  GetInstanceSecretsMessage,
  InstanceMessage,
  InstanceSecretsMessage,
  PatchDeploymentEnvMessage,
  PatchInstanceMessage,
  WS_TYPE_DEPLOYMENT_EVENT_LIST,
  WS_TYPE_FETCH_DEPLOYMENT_EVENTS,
  WS_TYPE_GET_INSTANCE,
  WS_TYPE_GET_INSTANCE_SECRETS,
  WS_TYPE_INSTANCE,
  WS_TYPE_INSTANCE_SECRETS,
  WS_TYPE_PATCH_DEPLOYMENT_ENV,
  WS_TYPE_PATCH_INSTANCE,
  WS_TYPE_PATCH_RECEIVED,
} from './deploy.message'
import { Observable, of, map } from 'rxjs'
import DeployMapper from './deploy.mapper'
import { deploymentStatusToDb, containerStateToDb } from 'src/domain/deployment'
import { PatchDeploymentDto, PatchInstanceDto } from './deploy.dto'

const DeploymentId = () => WsParam('deploymentId')

@WebSocketGateway({
  namespace: 'deployments/:deploymentId',
})
export default class DeployWebSocketGateway {
  constructor(private readonly service: DeployService, private readonly mapper: DeployMapper) {}

  @WsAuthorize()
  async onAuthorize(@DeploymentId() deploymentId: string, @IdentityFromSocket() identity: Identity): Promise<boolean> {
    // TODO(@robot9706): implement
    return true
  }

  @SubscribeMessage(WS_TYPE_FETCH_DEPLOYMENT_EVENTS)
  async fetchEvents(
    @DeploymentId() deploymentId: string,
    @MessageBody() message: WsMessage<unknown>,
  ): Promise<Observable<WsMessage<DeploymentEventListMessage> | WsMessage<DeploymentEventMessage>>> {
    const deployment = await this.service.getDeploymentDetails(deploymentId)
    const events = await this.service.getDeploymentEvents(deploymentId)

    if (deployment.status !== 'in-progress') {
      return of({
        type: WS_TYPE_DEPLOYMENT_EVENT_LIST,
        data: events,
      } as WsMessage<DeploymentEventListMessage>)
    }

    const observable = await this.service.subscribeToDeploymentEvents(deploymentId)

    return observable.pipe(
      map(it => {
        let events: DeploymentEventMessage[] = []

        // TODO(@robot9706): some kind of proper mapping
        if (it.log) {
          events.push({
            type: 'log',
            createdAt: new Date(),
            log: it.log,
          })
        }
        if (it.status) {
          events.push({
            type: 'deployment-status',
            createdAt: new Date(),
            deploymentStatus: this.mapper.statusToDto(deploymentStatusToDb(it.status)),
          })
        }
        if (it.instance) {
          events.push({
            type: 'container-status',
            createdAt: new Date(),
            containerState: {
              instanceId: it.instance.instanceId,
              state: this.mapper.containerStateToDb(it.instance.state),
            }
          })
        }

        const msg: WsMessage<DeploymentEventListMessage> = {
          type: WS_TYPE_DEPLOYMENT_EVENT_LIST,
          data: events,
        }

        return msg
      }),
    )
  }

  @SubscribeMessage(WS_TYPE_PATCH_INSTANCE)
  async patchInstance(@DeploymentId() deploymentId: string, @MessageBody() message: WsMessage<PatchInstanceMessage>, @IdentityFromSocket() identity: Identity): Promise<WsMessage<unknown>> {
    const req = message.data
    const cruxReq: Pick<PatchInstanceDto, 'config'> = {
      config: {},
    }

    if (req.resetSection) {
      cruxReq.config[req.resetSection as string] = null
    } else {
      cruxReq.config = req.config
    }

    await this.service.patchInstance(deploymentId, req.instanceId, cruxReq, identity)

    /*endpoint.sendAllExcept(connection, WS_TYPE_INSTANCE_UPDATED, {
      ...req,
    })*/

    return {
      type: WS_TYPE_PATCH_RECEIVED,
      data: null
    }
  }

  @SubscribeMessage(WS_TYPE_PATCH_DEPLOYMENT_ENV)
  async patchDeploymentEnvironment(@DeploymentId() deploymentId: string, @MessageBody() message: WsMessage<PatchDeploymentEnvMessage>, @IdentityFromSocket() identity: Identity): Promise<WsMessage<unknown>> {
    const cruxReq: PatchDeploymentDto = {
      environment: message.data,
    }

    await this.service.patchDeployment(deploymentId, cruxReq, identity)

    // endpoint.sendAllExcept(connection, WS_TYPE_DEPLOYMENT_ENV_UPDATED, req)

    return {
      type: WS_TYPE_PATCH_RECEIVED,
      data: null
    }
  }

  @SubscribeMessage(WS_TYPE_GET_INSTANCE)
  async getInstance(@MessageBody() message: WsMessage<GetInstanceMessage>): Promise<WsMessage<InstanceMessage>> {
    const instance = await this.service.getInstance(message.data.id)

    return {
      type: WS_TYPE_INSTANCE,
      data: instance,
    }
  }

  @SubscribeMessage(WS_TYPE_GET_INSTANCE_SECRETS)
  async getInstanceSecrets(@MessageBody() message: WsMessage<GetInstanceSecretsMessage>): Promise<WsMessage<InstanceSecretsMessage>> {
    const secrets = await this.service.getInstanceSecrets(message.data.id)

    if (!secrets.keys) {
      return
    }

    return {
      type: WS_TYPE_INSTANCE_SECRETS,
      data: {
        instanceId: message.data.id,
        keys: secrets.keys,
      },
    }
  }
}
