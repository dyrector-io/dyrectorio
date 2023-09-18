import { WS_CONNECT_DELAY_PER_TRY, WS_MAX_CONNECT_TRY } from '@app/const'
import { Logger } from '@app/logger'
import { WsErrorMessage, WS_TYPE_ERROR } from '@app/models'
import { SubscriptionMessage, WsErrorHandler, WsMessage, WS_TYPE_SUBBED, WS_TYPE_UNSUBBED } from './common'
import WebSocketClientEndpoint from './websocket-client-endpoint'
import WebSocketClientRoute from './websocket-client-route'

class WebSocketClient {
  // NOTE(@robot9706): According to the WebSocket spec the 4000-4999 code range is available to applications
  public static ERROR_UNAUTHORIZE = 4401

  private logger = new Logger('WebSocketClient') // need to be explicit string because of production build uglification

  private socket?: WebSocket

  private connectionAttempt?: Promise<boolean>

  private connectionAttemptCount = 0

  private destroyListeners?: VoidFunction

  private routes: Map<string, WebSocketClientRoute> = new Map()

  private errorHandler: WsErrorHandler = null

  private kicked: boolean = false

  get connected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  async register(endpoint: WebSocketClientEndpoint) {
    const { path } = endpoint

    this.logger.debug('Registering endpoint for', path)

    let route = this.routes.get(path)
    if (!route) {
      // this is a new route, which we do not have a subscription for yet
      route = new WebSocketClientRoute(this.logger, it => this.sendWsMessage(it), path)
      this.routes.set(path, route)
    }

    // ensure connection
    if (!(await this.connect())) {
      return
    }

    // ensure subscription
    route.subscribe(endpoint)
  }

  remove(endpoint: WebSocketClientEndpoint) {
    const { path } = endpoint

    this.logger.debug('Remove endpoint:', path)

    endpoint.close()

    const route = this.routes.get(path)
    if (route) {
      const shouldRemove = route.unsubscribe(endpoint)

      if (shouldRemove) {
        this.removeRoute(route)
      }
    }
  }

  close() {
    this.routes.forEach(route => route.clear())
    this.routes.clear()

    this.clearSocket()
    this.logger.debug('Connection closed.')
  }

  setErrorHandler(handler: WsErrorHandler) {
    this.errorHandler = handler
  }

  reset() {
    if (this.socket && this.socket?.readyState !== WebSocket.CLOSED) {
      return
    }

    this.kicked = false
    this.connectionAttemptCount = 0

    this.reconnect()
  }

  private removeRoute(route: WebSocketClientRoute) {
    const { path } = route
    this.routes.delete(path)

    if (this.routes.size < 1) {
      this.logger.debug('There is no routes open. Closing connection.')
      this.close()
    }
  }

  private clearSocket() {
    if (!this.socket) {
      return
    }

    const ws = this.socket
    this.socket = null
    ws.close()
    this.destroyListeners?.call(null)
  }

  private async connect(): Promise<boolean> {
    if (this.connectionAttemptCount >= WS_MAX_CONNECT_TRY) {
      return false
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // we are already connected
      return true
    }

    if (this.kicked) {
      return false
    }

    // if there is already a connctionAttempt wait for the result
    if (this.connectionAttempt && (await this.connectionAttempt)) {
      // it was successful
      return true
    }

    // try to connect
    this.connectionAttempt = this.createConnectionAttempt()
    const result = await this.connectionAttempt

    this.connectionAttemptCount = result ? 0 : this.connectionAttemptCount + 1
    this.connectionAttempt = null

    return result
  }

  private sendWsMessage(message: WsMessage): boolean {
    if (!this.connected) {
      // can not send
      return false
    }

    this.logger.verbose('Sending message:', message.type, message.data)

    const json = JSON.stringify(message)
    this.socket.send(json)
    return true
  }

  private onSubscriptionMessage(message: WsMessage<SubscriptionMessage>): void {
    const { type } = message

    const route = this.routes.get(message.data.path)
    if (type === WS_TYPE_SUBBED) {
      // subscribed

      if (!route) {
        this.logger.error(`No route for ${message.data.path}`)
        return
      }

      route.onSubscribed()
    } else {
      // unsubscribed

      const shouldRemove = route?.onUnsubscribed()
      if (shouldRemove) {
        // no more endpoints

        this.removeRoute(route)
      }
    }
  }

  private reconnect() {
    if (this.connectionAttemptCount >= WS_MAX_CONNECT_TRY) {
      return
    }

    if (this.routes.size < 1) {
      // no need to reconnect
      this.logger.debug('Reconnect skipped: there are no endpoints')
      return
    }

    if (!this.socket) {
      // probably the connection was killed in the meantime

      this.logger.debug('Reconnect skipped: socket is null')
      return
    }

    if (this.socket.readyState !== WebSocket.CLOSED) {
      // a connection attempt is in progress, we are disconnecting, or we are already connected
      return
    }

    this.logger.debug('Reconnecting...')
    this.connect()
  }

  private createConnectionAttempt(): Promise<boolean> {
    const failTimeout = (this.connectionAttemptCount + 1) * WS_CONNECT_DELAY_PER_TRY

    return new Promise<boolean>(resolve => {
      this.logger.debug('Connecting...')
      let resolved = false

      const onOpen = () => {
        if (!resolved) {
          resolved = true
          resolve(true)
        }

        this.logger.info('Connected')
        this.routes.forEach(it => it.onSocketOpen())
      }

      const onClose = (it: CloseEvent) => {
        if (!resolved) {
          resolved = true
          setTimeout(() => resolve(false), failTimeout)
        }

        this.logger.info('Disconnected')

        this.errorHandler({
          status: it.code,
          message: it.reason,
        })

        this.routes.forEach(route => route.onSocketClose())

        if (it.code === WebSocketClient.ERROR_UNAUTHORIZE) {
          this.kicked = true
        } else {
          this.reconnect()
        }
      }

      const onError = ev => {
        resolved = true

        this.logger.error(`Error occurred:`, ev)
        this.routes.forEach(r => r.onError(ev))

        setTimeout(() => resolve(false), failTimeout)
      }

      const onMessage = ev => {
        const message = JSON.parse(ev.data) as WsMessage
        const { type } = message

        this.logger.verbose('Receiving message:', type, message.data)

        if (message.type === WS_TYPE_ERROR && this.errorHandler) {
          this.errorHandler(message.data as WsErrorMessage)
        } else if (type === WS_TYPE_SUBBED || type === WS_TYPE_UNSUBBED) {
          this.onSubscriptionMessage(message as WsMessage<SubscriptionMessage>)
          return
        }

        const path = WebSocketClientRoute.routePathOf(message)
        const route = this.routes.get(path)
        if (!route) {
          this.logger.error(`Route not found: ${path}`)
          return
        }

        route.onMessage(message)
      }

      this.clearSocket()
      this.socket = new WebSocket(this.assembleWsUrl())

      const ws = this.socket
      ws.addEventListener('open', onOpen)
      ws.addEventListener('close', onClose)
      ws.addEventListener('error', onError)
      ws.addEventListener('message', onMessage)

      this.destroyListeners = () => {
        ws.removeEventListener('open', onOpen)
        ws.removeEventListener('close', onClose)
        ws.removeEventListener('error', onError)
        ws.removeEventListener('message', onMessage)
      }
    })
  }

  private assembleWsUrl() {
    const { location } = window
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${location.host}/api`

    if (process.env.NODE_ENV === 'production' && protocol === 'ws:') {
      this.logger.warn('Insecure WebSocket connection in production environment!')
    }

    return url
  }
}

export default WebSocketClient
