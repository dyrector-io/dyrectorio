import ServiceContainer from '@server/dependency-injection/service-container'
import { IncomingMessage } from 'http'
import { NextApiRequest } from 'next'
import { WsMessage } from './common'
import WsConnection from './connection'

export type WsEndpointOnMessage = (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<object>,
) => Promise<any>

export type WsEndpointOptions = {
  onReady?: (endpoint: WsEndpoint) => Promise<any>
  onAuthorize?: (endpoint: WsEndpoint, req: NextApiRequest) => Promise<boolean>
  onMessage?: WsEndpointOnMessage
  onConnect?: (endpoint: WsEndpoint, connection: WsConnection, request: IncomingMessage) => void
  onDisconnect?: (endpoint: WsEndpoint, connection: WsConnection) => void
}

class WsEndpoint {
  private connections: Set<WsConnection> = new Set()

  readonly services = new ServiceContainer()

  constructor(
    public readonly route: string,
    public readonly query: { [key: string]: string | string[] },
    public readonly interests: Array<string>,
    private readonly options?: WsEndpointOptions,
  ) {}

  async authorize(req: NextApiRequest): Promise<boolean> {
    const handler = this.options?.onAuthorize
    if (handler) {
      return await handler(this, req)
    }

    return true
  }

  sendAll<T extends object>(type: string, payload: T) {
    Array.from(this.connections.values()).forEach(it => it.send(type, payload))
  }

  sendAllExcept<T extends object>(except: WsConnection, type: string, payload: T) {
    Array.from(this.connections.values())
      .filter(it => it !== except)
      .forEach(it => it.send(type, payload))
  }

  onConnect(connection: WsConnection, req: IncomingMessage) {
    if (!this.connections.has(connection)) {
      this.connections.add(connection)
      this.options?.onConnect?.call(null, this, connection, req)
    }
  }

  onDisconnect(connection: WsConnection) {
    if (this.connections.delete(connection)) {
      this.options?.onDisconnect?.call(null, this, connection)
    }
  }

  onMessage(connection: WsConnection, message: WsMessage<object>) {
    const handler = this.options?.onMessage
    if (handler) {
      handler(this, connection, message)
    }
  }
}

export default WsEndpoint
