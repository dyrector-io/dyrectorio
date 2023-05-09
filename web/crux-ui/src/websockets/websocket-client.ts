import { WS_RECONNECT_TIMEOUT } from '@app/const'
import { Logger } from '@app/logger'
import { WsErrorMessage, WS_TYPE_ERROR } from '@app/models'
import {
  SubscriptionMessage,
  SubscriptionRedirectMessage,
  WsErrorHandler,
  WsMessage,
  WS_TYPE_SUBBED,
  WS_TYPE_SUB_REDIRECT,
  WS_TYPE_UNSUBBED,
} from './common'
import WebSocketClientEndpoint from './websocket-client-endpoint'
import WebSocketClientRoute from './websocket-client-route'

class WebSocketClient {
  private logger = new Logger('WebSocketClient') // need to be explicit string because of production build uglification

  private socket?: WebSocket

  private connectionAttempt?: Promise<boolean>

  private lastAttempt = 0

  private destroyListeners?: VoidFunction

  private routes: Map<string, WebSocketClientRoute> = new Map()

  private redirectedRoutes: Map<string, string> = new Map()

  private errorHandler: WsErrorHandler = null

  get connected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  async register(endpoint: WebSocketClientEndpoint) {
    let { path } = endpoint

    const redirected = this.redirectedRoutes.get(path)
    if (redirected) {
      // if we have a route registered with the same path which was already redirected
      // we just use that path
      path = redirected
    }

    this.logger.debug('Registering endpoint for', path)

    let route = this.routes.get(path)
    if (!route) {
      // this is a new route, which we do not have a subscription for yet
      route = new WebSocketClientRoute(this.logger, it => this.sendWsMessage(it), path)
      this.routes.set(path, route)
    }

    // ensure connection
    await this.connect()

    // ensure subscription
    route.subscribe(endpoint)
  }

  remove(endpoint: WebSocketClientEndpoint) {
    const path = this.redirectedRoutes.get(endpoint.path) ?? endpoint.path

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
    this.redirectedRoutes.clear()

    this.clearSocket()
    this.logger.debug('Connection closed.')
  }

  setErrorHandler(handler: WsErrorHandler) {
    this.errorHandler = handler
  }

  private removeRoute(route: WebSocketClientRoute) {
    const { path } = route
    this.routes.delete(path)

    const { redirectedFrom } = route
    if (redirectedFrom) {
      this.redirectedRoutes.delete(redirectedFrom)
      this.logger.verbose('Route redirection deleted', redirectedFrom)
    }

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
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // we are already connected
      return true
    }

    // if there is already a connctionAttempt wait for the result
    if (this.connectionAttempt && (await this.connectionAttempt)) {
      // it was successful
      return true
    }

    // try to connect
    this.connectionAttempt = this.createConnectionAttempt()

    const result = await this.connectionAttempt
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

    if (type === WS_TYPE_SUB_REDIRECT) {
      // redirection
      // we have to repeat the subscription request with the provided path

      const msg = message.data as SubscriptionRedirectMessage
      const { redirect, path } = msg
      const route = this.routes.get(path)
      if (!route) {
        // can't find the route we got the redirection message for

        this.logger.debug('Redirected route not found', path)
        return
      }

      // replace the old route with the corrected one
      this.routes.delete(path)
      this.routes.set(redirect, route)

      // save the redirection
      this.redirectedRoutes.set(path, redirect)

      route.onRedirect(redirect)
      return
    }

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

    const now = Date.now()
    const elapsed = now - this.lastAttempt
    if (elapsed < WS_RECONNECT_TIMEOUT) {
      // try again if we can't connect in time
      setTimeout(() => this.reconnect(), WS_RECONNECT_TIMEOUT - elapsed)
      return
    }

    this.logger.debug('Reconnecting...')
    this.connect()
  }

  private createConnectionAttempt(): Promise<boolean> {
    this.lastAttempt = Date.now()

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

      const onClose = () => {
        if (!resolved) {
          resolved = true
          resolve(false)
        }

        this.logger.info('Disconnected')

        this.routes.forEach(it => it.onSocketClose())
        this.reconnect()
      }

      const onError = ev => {
        this.logger.error(`Error occurred:`, ev)

        this.routes.forEach(r => r.onError(ev))
        resolve(false)
      }

      const onMessage = ev => {
        const message = JSON.parse(ev.data) as WsMessage
        const { type } = message

        this.logger.verbose('Receiving message:', type, message.data)

        if (message.type === WS_TYPE_ERROR && this.errorHandler) {
          this.errorHandler(message.data as WsErrorMessage)
        } else if (type === WS_TYPE_SUBBED || type === WS_TYPE_UNSUBBED || message.type === WS_TYPE_SUB_REDIRECT) {
          this.onSubscriptionMessage(message as WsMessage<SubscriptionMessage>)
          return
        }

        this.routes.forEach(r => r.onMessage(message))
      }

      this.clearSocket()
      this.socket = new WebSocket(WebSocketClient.assembleWsUrl())

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

  private static assembleWsUrl() {
    const { location } = window
    // TODO create some warning when we are in production build but the connection is insecure
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${location.host}/api`
  }
}

export default WebSocketClient
