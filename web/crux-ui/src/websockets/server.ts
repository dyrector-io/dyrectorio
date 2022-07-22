import { Logger } from '@app/logger'
import { distinct } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { sessionOf } from '@server/kratos'
import { randomUUID } from 'crypto'
import http, { IncomingMessage, Server as HTTPServer } from 'http'
import { Server as HTTPSServer } from 'https'
import { NextApiRequest, NextApiResponse } from 'next'
import WebSocket from 'ws'
import { WsConnectDto, WsMessage } from './common'

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

export class WsConnection {
  endpoints: Array<WsEndpoint> = []
  data: Map<string, any> = new Map()

  constructor(
    public readonly token: string,
    public readonly identity: Identity,
    public readonly address: string,
    public readonly socket: WebSocket,
    public request: http.IncomingMessage,
  ) {}

  sendWsMessage(message: WsMessage<object>) {
    if (this.socket.readyState === WebSocket.OPEN) {
      const json = JSON.stringify(message)
      this.socket.send(json)
    }
  }

  send<T extends object>(type: string, payload: T) {
    this.sendWsMessage({
      type,
      payload,
    } as WsMessage<T>)
  }
}

type AuthorizationEntry = {
  expiration: Date
  identity: Identity
}

export class WsAuthorizer {
  private static EXPIRATION = 5000 // millis

  private pendingTokens: Map<string, AuthorizationEntry> = new Map()

  generate(identity: Identity): string {
    const token = randomUUID()
    this.pendingTokens.set(token, {
      identity,
      expiration: new Date(),
    })
    return token
  }

  exchange(token: string, socket: WebSocket): Identity {
    this.clearExpired()

    return this.pendingTokens.get(token)?.identity
  }

  private clearExpired() {
    const now = Date.now()
    const expired: Array<string> = []
    this.pendingTokens.forEach((value, key) => {
      if (now - value.expiration.getTime() >= WsAuthorizer.EXPIRATION) {
        expired.push(key)
      }
    })

    expired.forEach(it => this.pendingTokens.delete(it))
  }
}

export class WsEndpoint {
  private connections: Array<WsConnection> = []

  constructor(
    private logger: Logger,
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
    connection.endpoints.push(this)

    this.options?.onConnect?.call(null, this, connection, req)
  }

  onDisconnect(connection: WsConnection) {
    this.connections = this.connections.filter(it => it !== connection)
    connection.endpoints = connection.endpoints.filter(it => it !== this)

    this.options?.onDisconnect?.call(null, this, connection)
  }

  onMessage(connection: WsConnection, message: WsMessage<object>) {
    if (!this.connections.includes(connection)) {
      // TODO: send endpoint url hash in messages, so we can route by them, before filtering on interest
      this.logger.warn('Unauthorized message', message?.type, 'from', connection.address)
      return
    }

    const handler = this.options?.onMessage
    if (handler) {
      handler(this, connection, message)
    }
  }
}

export class WebSocketServer {
  private logger = new Logger(WebSocketServer.name)

  private authorizer = new WsAuthorizer()
  private server: WebSocket.Server
  private endpoints: Map<string, WsEndpoint> = new Map()
  private connectionsByToken: Map<string, WsConnection> = new Map()
  private connectionsBySocket: Map<WebSocket, WsConnection> = new Map()
  private interests: Map<string, Array<WsEndpoint>> = new Map()

  constructor(httpServer: HTTPServer | HTTPSServer) {
    this.server = new WebSocket.Server({
      server: httpServer,
    })

    this.server.on('connection', (socket, request: IncomingMessage) => this.onConnect(socket, request))
  }

  getEndpoint(route: string) {
    return this.endpoints.get(route)
  }

  registerEndpoint(endpoint: WsEndpoint) {
    if (this.endpoints.has(endpoint.route)) {
      this.logger.error('Endpoint for route', null, endpoint.route, 'is already registered.')
      return
    }

    this.endpoints.set(endpoint.route, endpoint)

    const interests = this.interests
    endpoint.interests.forEach(it => {
      let endpoints = interests.get(it)
      if (!endpoints) {
        endpoints = []
        interests.set(it, endpoints)
      }

      endpoints.push(endpoint)
    })
  }

  async subscribe(req: NextApiRequest, res: NextApiResponse) {
    const route = req.url
    const endpoint = this.endpoints.get(route)
    if (!endpoint) {
      this.logger.error('Subscribe failed. Endpoint for route', null, route, 'not found.')
      return
    }

    const authorized = await endpoint.authorize(req)
    if (!authorized) {
      res.status(401).end()
    }

    const token = req.headers.authorization
    const connection = this.connectionsByToken.get(token)
    if (!connection) {
      const session = sessionOf(req)

      res.json({
        token: this.authorizer.generate(session.identity),
      } as WsConnectDto)
    } else {
      endpoint.onConnect(connection, req)
      res.status(204).end()
    }
  }

  unsubscribe(req: NextApiRequest, res: NextApiResponse) {
    const route = req.url
    const endpoint = this.endpoints.get(route)
    if (!endpoint) {
      this.logger.error('Unsubscribe failed. Endpoint for route', null, route, 'not found.')
      return
    }

    const token = req.headers.authorization
    if (token) {
      endpoint.disconnect(token)
    }

    res.status(204).end()
  }

  private onConnect(socket: WebSocket, req: IncomingMessage) {
    const url = req.url

    if (process.env.NODE_ENV === 'development' && url.startsWith('/_next')) {
      return
    }

    const split = url?.split('?token=')
    if (split.length < 2) {
      this.logger.error('Connecting failed.', null, 'invalid-url', url)
      socket.close()
      return
    }

    const route = split[0]
    const token = split[1]

    const identity = this.authorizer.exchange(token, socket)
    if (!identity) {
      this.logger.error('Connecting failed', null, `unauthorized ${route}`)
      socket.close()
      return
    }

    const connection = new WsConnection(token, identity, req.socket.remoteAddress, socket, req)
    const endpoint = this.endpoints.get(route)
    if (!endpoint) {
      this.logger.error('Connecting failed', null, `endpoint-not-found ${route}`)
      socket.close()
      return
    }

    this.connectionsBySocket.set(socket, connection)
    this.connectionsByToken.set(token, connection)

    endpoint.onConnect(connection, req)
    this.logger.debug('Connected:', connection.address)

    socket.on('close', () => this.onDisconnect(connection))
    socket.on('message', (data, binary) => this.onMessage(socket, data, binary))
  }

  private onDisconnect(connection: WsConnection) {
    this.logger.debug('Disconnected:', connection.address)
    connection.endpoints.forEach(it => it.onDisconnect(connection))

    this.connectionsByToken.delete(connection.token)
    this.connectionsBySocket.delete(connection.socket)
  }

  private onMessage(socket: WebSocket, data: WebSocket.RawData, binary: boolean) {
    const connection = this.connectionsBySocket.get(socket)
    if (!connection) {
      this.logger.warn('No matching connection for socket. Terminating.', socket)
      socket.terminate()
      return
    }

    if (binary) {
      this.logger.warn('Received binary from:', connection.address)
      return
    }

    const stringData: string = data.toString()
    const message: WsMessage<object> = JSON.parse(stringData)


    if (!message || !message.type) {
      this.logger.warn('Illformed message from:', connection.address)
      this.logger.warn(stringData)
      return
    }

    const endpoints = this.interests.get(message.type)
    if (!endpoints || endpoints.length < 1) {
      this.logger.warn('No endpoint for message:', message.type)
      return
    }

    endpoints.forEach(it => it.onMessage(connection, message))
  }
}
