import { WS_RECONNECT_TIMEOUT } from '@app/const'
import { Logger } from '@app/logger'
import { DyoApiError, WS_TYPE_ERROR } from '@app/models'
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

  private unsubscribe?: VoidFunction

  private routes: Map<string, WebSocketClientRoute> = new Map()

  private redirectedRoutes: Map<string, string> = new Map()

  private errorHandler: WsErrorHandler = null

  async register(endpoint: WebSocketClientEndpoint) {
    let { path } = endpoint

    const redirected = this.redirectedRoutes.get(path)
    if (redirected) {
      path = redirected
    }

    this.logger.debug('Registering endpoint for', path)

    let route = this.routes.get(path)
    if (!route) {
      console.log('route wasnt found', path, Array.from(this.redirectedRoutes.entries()))
      route = new WebSocketClientRoute(this.logger, it => this.sendWsMessage(it), path)
      this.routes.set(path, route)
    }

    await this.connect()
    route.subscribe(endpoint)
  }

  async remove(endpoint: WebSocketClientEndpoint) {
    const { path } = endpoint

    this.logger.debug('Disconnecting:', path)

    endpoint.kill()

    const route = this.routes.get(path)
    if (route) {
      const shouldRemove = await route.unsubscribe(endpoint)
      if (shouldRemove) {
        this.routes.delete(path)
        if (route.redirectedFrom) {
          this.redirectedRoutes.delete(route.redirectedFrom)
        }
      }
    }

    if (this.routes.size < 1) {
      this.logger.debug('There is no routes open. Closing connection.')
      this.close()
    }
  }

  close() {
    this.routes.forEach(route => route.clear())
    this.routes.clear()
    this.redirectedRoutes.clear()

    if (!this.socket) {
      return
    }

    this.socket.close()
    this.socket = null
    this.logger.debug('Connection closed.')
  }

  setErrorHandler(handler: WsErrorHandler) {
    this.errorHandler = handler
  }

  private async connect(): Promise<boolean> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return true
    }

    if (this.connectionAttempt && (await this.connectionAttempt)) {
      return true
    }

    this.lastAttempt = Date.now()
    this.connectionAttempt = (async () => {
      this.unsubscribe?.call(this)

      return await new Promise<boolean>(resolve => {
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
            this.errorHandler(message.data as DyoApiError)
          } else if (type === WS_TYPE_SUBBED || type === WS_TYPE_UNSUBBED || message.type === WS_TYPE_SUB_REDIRECT) {
            this.onSubscriptionMessage(message as WsMessage<SubscriptionMessage>)
            return
          }

          this.routes.forEach(r => r.onMessage(message))
        }

        this.socket?.close()
        this.socket = new WebSocket(WebSocketClient.assembleWsUrl())

        const ws = this.socket
        ws.addEventListener('open', onOpen)
        ws.addEventListener('close', onClose)
        ws.addEventListener('error', onError)
        ws.addEventListener('message', onMessage)

        this.unsubscribe = () => {
          ws.removeEventListener('open', onOpen)
          ws.removeEventListener('close', onClose)
          ws.removeEventListener('error', onError)
          ws.removeEventListener('message', onMessage)
        }
      })
    })()

    const result = await this.connectionAttempt
    this.connectionAttempt = null
    return result
  }

  private sendWsMessage(message: WsMessage): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
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
      const msg = message.data as SubscriptionRedirectMessage
      const { redirect, path } = msg
      const route = this.routes.get(path)
      if (!route) {
        this.logger.debug('Redirected route not found', path)
        return
      }

      this.routes.delete(path)
      this.routes.set(redirect, route)
      this.redirectedRoutes.set(path, redirect)
      route.onRedirect(redirect)
    }

    const route = this.routes.get(message.data.path)
    if (type === WS_TYPE_SUBBED) {
      if (!route) {
        this.logger.error(`No route for ${message.data.path}`)
        return
      }

      route.onSubscribed()
    } else {
      const shouldRemove = route?.onUnsubscribed()
      if (shouldRemove) {
        this.routes.delete(route.path)
        if (route.redirectedFrom) {
          this.redirectedRoutes.delete(route.redirectedFrom)
        }
      }
    }
  }

  private reconnect() {
    if (this.routes.size < 1) {
      this.logger.debug('Reconnect skipped: there are no endpoints')
      return
    }

    if (!this.socket) {
      this.logger.debug('Reconnect skipped: socket is null')
      return
    }

    if (this.socket.readyState !== WebSocket.CLOSED) {
      return
    }

    const now = Date.now()
    const elapsed = now - this.lastAttempt
    if (elapsed < WS_RECONNECT_TIMEOUT) {
      setTimeout(() => this.reconnect(), WS_RECONNECT_TIMEOUT - elapsed)
      return
    }

    this.logger.debug('Reconnecting...')
    this.connect()
  }

  private static assembleWsUrl() {
    const { location } = window
    // TODO create some warning when we are in production build but the connection is insecure
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${location.host}/api/new`
  }
}

export default WebSocketClient
