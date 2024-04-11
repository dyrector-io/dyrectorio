import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { Identity } from '@ory/kratos-client'
import { Observable, map, merge } from 'rxjs'
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
  ContainerLogStartedMessage,
  ContainersStateListMessage,
  DeleteContainerMessage,
  SetContainerLogTakeMessage,
  WS_TYPE_CONTAINERS_STATE_LIST,
  WS_TYPE_CONTAINER_LOG,
  WS_TYPE_CONTAINER_LOG_STARTED,
  WS_TYPE_SET_CONTAINER_LOG_TAKE,
  WS_TYPE_WATCH_CONTAINER_LOG,
  WatchContainerLogMessage,
  WatchContainersStateMessage,
} from './node.message'
import NodeService from './node.service'
import NodeContainerLogQueryValidationPipe from './pipes/node.container-log-query.pipe'

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

  @SubscribeMessage(WS_TYPE_SET_CONTAINER_LOG_TAKE)
  setContainerLogTake(
    @NodeId() nodeId: string,
    @SocketMessage(NodeContainerLogQueryValidationPipe) message: SetContainerLogTakeMessage,
  ): void {
    this.service.setContainerLogTake(nodeId, message)
  }

  @AuditLogLevel('disabled')
  @SubscribeMessage(WS_TYPE_WATCH_CONTAINER_LOG)
  watchContainerLog(
    @NodeId() nodeId: string,
    @SocketMessage(NodeContainerLogQueryValidationPipe) message: WatchContainerLogMessage,
  ): Observable<WsMessage<ContainerLogMessage | ContainerLogStartedMessage>> {
    const [messagesStream, startMessagesStream] = this.service.watchContainerLog(nodeId, message)

    const messages = messagesStream.pipe(
      map(it => {
        const msg: WsMessage<ContainerLogMessage> = {
          type: WS_TYPE_CONTAINER_LOG,
          data: it,
        }

        return msg
      }),
    )

    const startMessages = startMessagesStream.pipe(
      map(it => {
        const msg: WsMessage<ContainerLogStartedMessage> = {
          type: WS_TYPE_CONTAINER_LOG_STARTED,
          data: it,
        }

        return msg
      }),
    )

    return merge(startMessages, messages)
  }

  @SubscribeMessage('delete-container')
  async deleteContainer(@NodeId() nodeId: string, @SocketMessage() message: DeleteContainerMessage): Promise<void> {
    const { container } = message

    await this.service.deleteContainer(nodeId, container.prefix, container.name)
  }
}
