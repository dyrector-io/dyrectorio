import WsConnection from '@app/websockets/connection'
import ContainerLogStream from './container-log-stream'
import DyoNodeService from './crux/node-service'

class ContainerLogStreamService {
  private streams: Map<string, ContainerLogStream> = new Map()

  private connectionToContainers: Map<WsConnection, Set<string>> = new Map()

  constructor(private nodeId: string) {}

  startWatching(connection: WsConnection, prefix: string, name: string, nodeService: DyoNodeService) {
    const container = `${prefix}-${name}`

    let stream = this.streams.get(container)
    if (!stream) {
      stream = new ContainerLogStream(prefix, name)
      stream.start(connection, this.nodeId, nodeService)
      this.streams.set(container, stream)
    } else {
      stream.addConnection(connection)
    }

    let containers = this.connectionToContainers.get(connection)
    if (!containers) {
      containers = new Set()
      this.connectionToContainers.set(connection, containers)
    }

    containers.add(container)
  }

  stopWatching(connection: WsConnection, prefix: string, name: string) {
    const container = `${prefix}-${name}`
    this.removeConnectionFromWatcher(connection, container)

    const containers = this.connectionToContainers.get(connection)
    if (!containers) {
      return
    }

    containers.delete(container)
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
