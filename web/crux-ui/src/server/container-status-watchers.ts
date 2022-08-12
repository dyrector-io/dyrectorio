import { ContainerListMessage, WS_TYPE_CONTAINER_STATUS_LIST } from '@app/models'
import { ContainerStateListMessage } from '@app/models/grpc/protobuf/proto/crux'
import { WsConnection } from '@app/websockets/server'
import { GrpcConnection } from './crux/grpc-connection'
import DyoNodeService from './crux/node-service'

class ContainerStatusWatcher {
  private grpc: GrpcConnection<ContainerStateListMessage, ContainerListMessage> = null
  private connections: Set<WsConnection> = new Set()

  constructor(public prefix: string) {}

  start(connection: WsConnection, nodeId: string, nodeService: DyoNodeService) {
    this.addConnection(connection)

    this.grpc = nodeService.watchContainerState(nodeId, this.prefix, {
      onMessage: message => {
        this.connections.forEach(it => it.send(WS_TYPE_CONTAINER_STATUS_LIST, message))
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

export class ContainerStatusWatcherService {
  private watchers: Map<string, ContainerStatusWatcher> = new Map()
  private connectionToPrefixes: Map<WsConnection, Set<string>> = new Map()

  constructor(private nodeId: string) {}

  startWatching(connection: WsConnection, prefix: string, nodeService: DyoNodeService) {
    let watcher = this.watchers.get(prefix)
    if (!watcher) {
      watcher = new ContainerStatusWatcher(prefix)
      watcher.start(connection, this.nodeId, nodeService)
      this.watchers.set(prefix, watcher)
    } else {
      watcher.addConnection(connection)
    }

    let prefixes = this.connectionToPrefixes.get(connection)
    if (!prefixes) {
      prefixes = new Set()
      this.connectionToPrefixes.set(connection, prefixes)
    }

    prefixes.add(prefix)
  }

  stopWatching(connection: WsConnection, prefix: string) {
    this.removeConnectionFromWatcher(connection, prefix)

    const prefixes = this.connectionToPrefixes.get(connection)
    if (!prefixes) {
      return
    }

    prefixes.delete(prefix)
    if (prefixes.size < 1) {
      this.connectionToPrefixes.delete(connection)
    }
  }

  onWebSocketDisconnected(connection: WsConnection) {
    const prefixes = this.connectionToPrefixes.get(connection)
    if (!prefixes) {
      return
    }

    prefixes.forEach(it => this.removeConnectionFromWatcher(connection, it))

    this.connectionToPrefixes.delete(connection)
  }

  private removeConnectionFromWatcher(connection: WsConnection, prefix: string) {
    const watcher = this.watchers.get(prefix)

    if (!watcher) {
      return
    }

    const killed = watcher.removeConnection(connection)
    if (killed) {
      this.watchers.delete(prefix)
    }
  }
}
