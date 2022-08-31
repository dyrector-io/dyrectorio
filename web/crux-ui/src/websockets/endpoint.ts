import { distinct } from '@app/utils'
import { IncomingMessage } from 'http'
import { NextApiRequest } from 'next'
import { IWsConnection, IWsEndpoint, WsEndpointOptions, WsMessage } from './common'

class WsEndpoint implements IWsEndpoint {
  private connections: Array<IWsConnection> = []

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

  sendAllExcept<T extends object>(type: string, payload: T, except: IWsConnection) {
    distinct(this.connections)
      .filter(it => it !== except)
      .forEach(it => it.send(type, payload))
  }

  onConnect(connection: IWsConnection, req: IncomingMessage) {
    this.connections.push(connection)
    connection.endpoints.add(this)

    this.options?.onConnect?.call(null, this, connection, req)
  }

  onDisconnect(connection: IWsConnection) {
    this.connections = this.connections.filter(it => it !== connection)
    connection.endpoints.delete(this)

    this.options?.onDisconnect?.call(null, this, connection)
  }

  onMessage(connection: IWsConnection, message: WsMessage<object>) {
    if (!connection.endpoints.has(this)) {
      return
    }

    const handler = this.options?.onMessage
    if (handler) {
      handler(this, connection, message)
    }
  }
}

export default WsEndpoint
