import { containerNameOf } from '@app/models'
import { ContainerIdentifier } from '@app/models/grpc/protobuf/proto/common'
import WsConnection from '@app/websockets/connection'
import ContainerLogStream from './container-log-stream'
import DyoNodeService from './crux/node-service'

class ContainerLogStreamService {
  private streams: Map<string, ContainerLogStream> = new Map()

  private connectionToContainers: Map<WsConnection, Set<string>> = new Map()

  constructor(private nodeId: string) {}

  startWatching(connection: WsConnection, nodeService: DyoNodeService, container: ContainerIdentifier) {
    const key = containerNameOf(container)

    let stream = this.streams.get(key)
    if (!stream) {
      stream = new ContainerLogStream(container)
      stream.start(connection, this.nodeId, nodeService)
      this.streams.set(key, stream)
    } else {
      stream.addConnection(connection)
    }

    let containers = this.connectionToContainers.get(connection)
    if (!containers) {
      containers = new Set()
      this.connectionToContainers.set(connection, containers)
    }

    containers.add(key)
  }

  stopWatching(connection: WsConnection, container: ContainerIdentifier) {
    const key = containerNameOf(container)
    this.removeConnectionFromWatcher(connection, key)

    const containers = this.connectionToContainers.get(connection)
    if (!containers) {
      return
    }

    containers.delete(key)
    if (containers.size < 1) {
      this.connectionToContainers.delete(connection)
    }
  }

  onWebSocketDisconnected(connection: WsConnection) {
    const containers = this.connectionToContainers.get(connection)
    if (!containers) {
      return
    }

    containers.forEach(it => this.removeConnectionFromWatcher(connection, it))

    this.connectionToContainers.delete(connection)
  }

  private removeConnectionFromWatcher(connection: WsConnection, container: string) {
    const stream = this.streams.get(container)

    if (!stream) {
      return
    }

    const killed = stream.removeConnection(connection)
    if (killed) {
      this.streams.delete(container)
    }
  }
}

export default ContainerLogStreamService
