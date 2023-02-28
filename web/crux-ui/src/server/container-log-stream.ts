import { ContainerLogMessage, WS_TYPE_CONTAINER_LOG } from '@app/models'
import {
  ContainerIdentifier,
  ContainerLogMessage as GrpcContainerLogMessage,
} from '@app/models/grpc/protobuf/proto/common'
import WsConnection from '@app/websockets/connection'
import { GrpcConnection } from './crux/grpc-connection'
import DyoNodeService from './crux/node-service'

class ContainerLogStream {
  private grpc: GrpcConnection<GrpcContainerLogMessage, ContainerLogMessage> = null

  private connections: Set<WsConnection> = new Set()

  constructor(public container: ContainerIdentifier) {}

  start(connection: WsConnection, nodeId: string, nodeService: DyoNodeService) {
    this.addConnection(connection)

    this.grpc = nodeService.watchContainerLog(nodeId, this.container, {
      onMessage: message => {
        if (message.log.length === 0) {
          return
        }
        this.connections.forEach(it => it.send(WS_TYPE_CONTAINER_LOG, message))
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

export default ContainerLogStream
