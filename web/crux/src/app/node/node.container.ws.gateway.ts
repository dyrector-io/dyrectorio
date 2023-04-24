import { UsePipes, ValidationPipe } from '@nestjs/common'
import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { Identity } from '@ory/kratos-client'
import { Observable, map } from 'rxjs'
import { WsAuthorize, WsMessage } from 'src/websockets/common'
import WsParam from 'src/websockets/decorators/ws.param.decorator'
import TeamService from '../team/team.service'
import { IdentityFromSocket } from '../token/jwt-auth.guard'
import {
  ContainerCommandMessage,
  ContainerLogMessage,
  ContainersStateListMessage,
  DeleteContainerMessage,
  WS_TYPE_CONTAINERS_STATE_LIST,
  WS_TYPE_CONTAINER_LOG,
  WatchContainerLogMessage,
  WatchContainersStateMessage as WatchContainersStatusMessage,
} from './node.message'
import NodeService from './node.service'

const NodeId = () => WsParam('nodeId')

@WebSocketGateway({
  namespace: 'nodes/:nodeId',
})
export default class NodeContainerWebSocketGateway {
  constructor(private readonly service: NodeService, private readonly teamService: TeamService) {}

  @WsAuthorize()
  async onAuthorize(@NodeId() nodeId: string, @IdentityFromSocket() identity: Identity): Promise<boolean> {
    // TODO(@m8vago): implement
    return true
  }

  @SubscribeMessage('update-node-agent')
  async updateNodeAgent(@NodeId() nodeId: string): Promise<void> {
    await this.service.updateNodeAgent(nodeId)
  }

  @SubscribeMessage('container-command')
  containerCommand(@NodeId() nodeId: string, @MessageBody() message: ContainerCommandMessage): void {
    const { container, operation } = message
    if (operation === 'start') {
      this.service.startContainer(nodeId, container.prefix, container.name)
    } else if (operation === 'stop') {
      this.service.stopContainer(nodeId, container.prefix, container.name)
    } else if (operation === 'restart') {
      this.service.restartContainer(nodeId, container.prefix, container.name)
    }
  }

  @SubscribeMessage('watch-containers-state')
  watchContainersState(
    @NodeId() nodeId: string,
    @MessageBody() message: WatchContainersStatusMessage,
  ): Observable<WsMessage<ContainersStateListMessage>> {
    return this.service.watchContainersState(nodeId, message).pipe(
      map(it => {
        const msg: WsMessage<ContainersStateListMessage> = {
          type: WS_TYPE_CONTAINERS_STATE_LIST,
          data: it,
        }

        return msg
      }),
    )
  }

  @SubscribeMessage('watch-container-log')
  watchContainer(
    @NodeId() nodeId: string,
    message: WatchContainerLogMessage,
  ): Observable<WsMessage<ContainerLogMessage>> {
    return this.service.watchContainerLog(nodeId, message).pipe(
      map(it => {
        const msg: WsMessage<ContainerLogMessage> = {
          type: WS_TYPE_CONTAINER_LOG,
          data: it,
        }

        return msg
      }),
    )
  }

  @SubscribeMessage('delete-container')
  deleteContainer(@NodeId() nodeId: string, message: DeleteContainerMessage): void {
    const { container } = message

    this.service.deleteContainer(nodeId, container.prefix, container.name)
  }

  @SubscribeMessage('update-agent')
  async updateAgent(@NodeId() nodeId: string): Promise<void> {
    await this.service.updateNodeAgent(nodeId)
  }
}
