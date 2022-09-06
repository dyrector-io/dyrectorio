import WsConnection from '@app/websockets/connection'
import ContainerStatusWatcher from './container-status-watcher'
import DyoNodeService from './crux/node-service'

class ContainerStatusWatcherService {
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

export default ContainerStatusWatcherService
