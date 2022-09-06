import { distinct } from '@app/utils'
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
  private connections: Array<WsConnection> = []

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

  disconnect(token: string) {
    const connection = this.connections.find(it => it.token === token)
    if (!connection) {
      return
    }

    this.onDisconnect(connection)
  }

  sendAll<T extends object>(type: string, payload: T) {
    distinct(this.connections).forEach(it => it.send(type, payload))
  }

  sendAllExcept<T extends object>(type: string, payload: T, except: WsConnection) {
    distinct(this.connections)
      .filter(it => it !== except)
      .forEach(it => it.send(type, payload))
  }

  onConnect(connection: WsConnection, req: IncomingMessage) {
    this.connections.push(connection)
    this.options?.onConnect?.call(null, this, connection, req)
  }

  onDisconnect(connection: WsConnection) {
    this.connections = this.connections.filter(it => it !== connection)
    this.options?.onDisconnect?.call(null, this, connection)
  }

  onMessage(connection: WsConnection, message: WsMessage<object>) {
    const handler = this.options?.onMessage
    if (handler) {
      handler(this, connection, message)
    }
  }
}

export default WsEndpoint
