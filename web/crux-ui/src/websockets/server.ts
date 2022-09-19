import { Logger } from '@app/logger'
import { sessionOf } from '@server/kratos'
import { IncomingMessage, Server as HTTPServer } from 'http'
import { Server as HTTPSServer } from 'https'
import { NextApiRequest, NextApiResponse } from 'next'
import { parse } from 'url'
import WebSocket from 'ws'
import WsAuthorizer from './authorizer'
import { WsConnectDto, WsMessage } from './common'
import WsConnection from './connection'
import WsEndpoint from './endpoint'

export type HttpServerWithInternals = (HTTPServer | HTTPSServer) & {
  ws: WebSocketServer
  _events: {
    upgrade: (request, socket, head) => void
  }
}

type ConnectionEntry = {
  connection: WsConnection
  endpoints: Set<WsEndpoint>
}

class WebSocketServer {
  private logger = new Logger(WebSocketServer.name)

  private authorizer = new WsAuthorizer()

  private server: WebSocket.Server

  private endpoints: Map<string, WsEndpoint> = new Map()

  private connectionsByToken: Map<string, ConnectionEntry> = new Map()

  private interests: Map<string, Array<WsEndpoint>> = new Map()

  constructor(httpServer: HttpServerWithInternals) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-underscore-dangle
      const hmrUpgrade = httpServer._events.upgrade

      const server = new WebSocket.Server({
        noServer: true,
      })
      this.server = server

      // eslint-disable-next-line no-underscore-dangle
      httpServer._events.upgrade = (request, socket, head) => {
        const { pathname } = parse(request.url)

        if (pathname === '/_next/webpack-hmr') {
          hmrUpgrade(request, socket, head)
        } else {
          server.handleUpgrade(request, socket, head, ws => {
            server.emit('connection', ws, request)
          })
        }
      }
    } else {
      this.server = new WebSocket.Server({
        server: httpServer,
      })

      this.server.on('connection', (socket, request: IncomingMessage) => this.onConnect(socket, request))
    }
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

    const { interests } = this
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
    const connEntry = this.connectionsByToken.get(token)
    if (!connEntry) {
      const session = sessionOf(req)

      res.json({
        token: this.authorizer.generate(session.identity),
      } as WsConnectDto)
    } else {
      connEntry.endpoints.add(endpoint)
      endpoint.onConnect(connEntry.connection, req)
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
    const { url } = req

    const split = url?.split('?token=')
    if (split.length < 2) {
      this.logger.error('Connecting failed.', null, 'invalid-url', url)
      socket.close()
      return
    }

    const route = split[0]
    const token = split[1]

    const identity = this.authorizer.exchange(token)
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

    const connEntry: ConnectionEntry = {
      connection,
      endpoints: new Set(),
    }

    this.connectionsByToken.set(token, connEntry)

    endpoint.onConnect(connection, req)
    this.logger.debug('Connected:', connection.address)

    socket.on('close', () => this.onDisconnect(connEntry))
    socket.on('message', (data, binary) => this.onMessage(connEntry, data, binary))
  }

  private onDisconnect(connEntry: ConnectionEntry) {
    const { connection, endpoints } = connEntry

    this.logger.debug('Disconnected:', connection.address)
    endpoints.forEach(it => it.onDisconnect(connection))

    this.connectionsByToken.delete(connection.token)
  }

  private onMessage(connEntry: ConnectionEntry, data: WebSocket.RawData, binary: boolean) {
    const { connection, endpoints } = connEntry

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

    const interests = this.interests.get(message.type)
    if (!interests || interests.length < 1) {
      this.logger.warn('No endpoint for message:', message.type)
      return
    }

    interests.filter(it => endpoints.has(it)).forEach(it => it.onMessage(connection, message))
  }
}

export default WebSocketServer
