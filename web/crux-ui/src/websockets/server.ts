import { Logger } from '@app/logger'
import { sessionOf } from '@server/kratos'
import { IncomingMessage, Server as HTTPServer } from 'http'
import { Server as HTTPSServer } from 'https'
import { NextApiRequest, NextApiResponse } from 'next'
import WebSocket from 'ws'
import WsAuthorizer from './authorizer'
import { IWsConnection, IWsEndpoint, WsConnectDto, WsMessage } from './common'
import WsConnection from './connection'

class WebSocketServer {
  private logger = new Logger(WebSocketServer.name)

  private authorizer = new WsAuthorizer()

  private server: WebSocket.Server

  private endpoints: Map<string, IWsEndpoint> = new Map()

  private connectionsByToken: Map<string, IWsConnection> = new Map()

  private connectionsBySocket: Map<WebSocket, IWsConnection> = new Map()

  private interests: Map<string, Array<IWsEndpoint>> = new Map()

  constructor(httpServer: HTTPServer | HTTPSServer) {
    this.server = new WebSocket.Server({
      server: httpServer,
    })

    this.server.on('connection', (socket, request: IncomingMessage) => this.onConnect(socket, request))
  }

  getEndpoint(route: string) {
    return this.endpoints.get(route)
  }

  registerEndpoint(endpoint: IWsEndpoint) {
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
    const { url } = req

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

export default WebSocketServer
