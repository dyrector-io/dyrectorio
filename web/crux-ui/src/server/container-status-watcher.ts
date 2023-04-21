import { ContainersStateListMessage, WS_TYPE_CONTAINERS_STATE_LIST } from '@app/models'
import { ContainerStateListMessage } from '@app/models/grpc/protobuf/proto/common'
import WsConnection from '@app/websockets/connection'
import { GrpcConnection } from './crux/grpc-connection'
import DyoNodeService from './crux/node-service'

class ContainerStatusWatcher {
  private grpc: GrpcConnection<ContainerStateListMessage, ContainersStateListMessage> = null

  private connections: Set<WsConnection> = new Set()

  constructor(public prefix: string) {}

  start(connection: WsConnection, nodeId: string, nodeService: DyoNodeService) {
    this.addConnection(connection)

    this.grpc = nodeService.watchContainerState(nodeId, this.prefix, {
      onMessage: message => {
        this.connections.forEach(it => it.send(WS_TYPE_CONTAINERS_STATE_LIST, message))
      },
    })
  }

  addConnection(connection: WsConnection) {
    this.connections.add(connection)
  }

  removeConnection(connection: WsConnection): boolean {
    this.connections.delete(connection)

    if (this.connections.size < 1) {
      this.grpc?.cancel()
      this.grpc = null
      return true
    }

    return false
  }
}

export default ContainerStatusWatcher
