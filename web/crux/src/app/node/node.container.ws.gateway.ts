import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { Identity } from '@ory/kratos-client'
import { Observable, map } from 'rxjs'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import { WsAuthorize, WsMessage } from 'src/websockets/common'
import {
  UseGlobalWsFilters,
  UseGlobalWsGuards,
  UseGlobalWsInterceptors,
} from 'src/websockets/decorators/ws.gateway.decorators'
import WsParam from 'src/websockets/decorators/ws.param.decorator'
import SocketMessage from 'src/websockets/decorators/ws.socket-message.decorator'
import { IdentityFromSocket } from '../token/jwt-auth.guard'
import {
  ContainerCommandMessage,
  ContainerLogMessage,
  ContainersStateListMessage,
  DeleteContainerMessage,
  WS_TYPE_CONTAINERS_STATE_LIST,
  WS_TYPE_CONTAINER_LOG,
  WatchContainerLogMessage,
  WatchContainersStateMessage,
} from './node.message'
import NodeService from './node.service'

const TeamSlug = () => WsParam('teamSlug')
const NodeId = () => WsParam('nodeId')

@WebSocketGateway({
  namespace: ':teamSlug/nodes/:nodeId',
})
@UseGlobalWsFilters()
@UseGlobalWsGuards()
@UseGlobalWsInterceptors()
export default class NodeContainerWebSocketGateway {
  constructor(private readonly service: NodeService) {}

  @WsAuthorize()
  async onAuthorize(
    @TeamSlug() teamSlug: string,
    @NodeId() nodeId: string,
    @IdentityFromSocket() identity: Identity,
  ): Promise<boolean> {
    return this.service.checkNodeIsInTheTeam(teamSlug, nodeId, identity)
  }

  @SubscribeMessage('container-command')
  async containerCommand(@NodeId() nodeId: string, @SocketMessage() message: ContainerCommandMessage): Promise<void> {
    const { container, operation } = message
    if (operation === 'start') {
      await this.service.startContainer(nodeId, container.prefix, container.name)
    } else if (operation === 'stop') {
      await this.service.stopContainer(nodeId, container.prefix, container.name)
    } else if (operation === 'restart') {
      await this.service.restartContainer(nodeId, container.prefix, container.name)
    }
  }

  @AuditLogLevel('disabled')
  @SubscribeMessage('watch-containers-state')
  watchContainersState(
    @NodeId() nodeId: string,
    @SocketMessage() message: WatchContainersStateMessage,
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

  @AuditLogLevel('disabled')
  @SubscribeMessage('watch-container-log')
  watchContainerLog(
    @NodeId() nodeId: string,
    @SocketMessage() message: WatchContainerLogMessage,
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
  async deleteContainer(@NodeId() nodeId: string, @SocketMessage() message: DeleteContainerMessage): Promise<void> {
    const { container } = message

    await this.service.deleteContainer(nodeId, container.prefix, container.name)
  }
}
