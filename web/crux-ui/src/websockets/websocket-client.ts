import { WS_RECONNECT_TIMEOUT } from '@app/const'
import { Logger } from '@app/logger'
import { DyoApiError, WS_TYPE_DYO_ERROR } from '@app/models'
import { WsConnectDto, WsErrorHandler, WsMessage } from './common'
import WebSocketClientEndpoint from './websocket-client-endpoint'
import WebSocketClientRoute from './websocket-client-route'

class WebSocketClient {
  private logger = new Logger('WebSocketClient') // need to be explicit string because of production build uglification

  private socket?: WebSocket

  private connectionAttempt?: Promise<boolean>

  private lastAttempt = 0

  private token?: string

  private unsubscribe?: VoidFunction

  private routes: Map<string, WebSocketClientRoute> = new Map()

  private errorHandler: WsErrorHandler = null

  async register(endpoint: WebSocketClientEndpoint): Promise<boolean> {
    const { url } = endpoint

    let route = this.routes.get(url)
    if (!route) {
      route = new WebSocketClientRoute(url)
      this.routes.set(url, route)
    }
    const connected = await this.connect(route)
    if (!route.endpoints.includes(endpoint)) {
      route.endpoints.push(endpoint)
    }

    if (connected) {
      if (route.subscribed) {
        endpoint.onOpen(msg => this.sendWsMessage(msg, endpoint.url))
      } else {
        await this.onRouteOpen(route)
      }
    }

    return connected
  }

  async remove(endpoint: WebSocketClientEndpoint) {
    const { url } = endpoint

    this.logger.debug('Disconnecting:', url)

    endpoint.kill()

    const route = this.routes.get(url)
    if (route) {
      const endpoints = route.endpoints.filter(it => it !== endpoint)
      if (endpoints.length > 0) {
        route.endpoints = endpoints
        return
      }

      this.routes.delete(url)

      await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.token,
        },
      })

      this.logger.debug('Unsubscribed:', url)
    }

    if (this.routes.size < 1) {
      this.logger.debug('There is no routes open. Closing connection.')
      this.close()
    }
  }

  close() {
    this.routes.forEach(route => route.kill())
    this.routes.clear()
    this.token = null
    if (this.socket) {
      this.socket.close()
      this.token = null
      this.socket = null
      this.logger.debug('Connection closed.')
    }
  }

  sendWsMessage(message: WsMessage<object>, url: string): boolean {
    const route = this.routes.get(url)
    if (!route) {
      this.logger.warn('Route not found', url)
      return true
    }

    route.endpoints.forEach(it => it.options?.onSend?.call(null, message))

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false
    }

    this.logger.verbose('Sending message:', message.type)
    this.logger.verbose('Content:', message.payload)

    const json = JSON.stringify(message)
    this.socket.send(json)
    return true
  }

  async subscribeToRoute(url: string): Promise<string> {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: !this.token
        ? defaultHeaders
        : {
            ...defaultHeaders,
            Authorization: this.token,
          },
    })

    if (!res.ok) {
      this.logger.debug('Failed to subscribe to:', url)
      this.logger.debug('ReadyState:', this.socket?.readyState)
      return null
    }
    if (res.status === 200) {
      const dto = (await res.json()) as WsConnectDto
      this.token = dto.token
    }

    if (res.redirected) {
      url = new URL(res.url).pathname
    }

    this.logger.debug('Subscribed:', url)
    return url
  }

  setErrorHandler(handler: WsErrorHandler) {
    this.errorHandler = handler
  }

  private async onRouteOpen(route: WebSocketClientRoute) {
    const url = await this.subscribeToRoute(route.url)
    route.onOpen(url, msg => this.sendWsMessage(msg, url))
  }

  private async connect(route: WebSocketClientRoute): Promise<boolean> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return true
    }

    if (this.connectionAttempt && (await this.connectionAttempt)) {
      return true
    }

    this.lastAttempt = Date.now()
    // eslint-disable-next-line
    this.connectionAttempt = new Promise<boolean>(async resolve => {
      this.token = null

      this.unsubscribe?.call(this)

      const url = await this.subscribeToRoute(route.url)
      route.subscribed = !!url
      if (!route.subscribed) {
        resolve(false)
        return
      }

      let resolved = false
      this.socket = new WebSocket(this.assembleWsUrl(url))

      const onOpen = () => {
        if (!resolved) {
          resolved = true
          resolve(true)
        }

        this.logger.info('Connected')
        this.routes.forEach(it => this.onRouteOpen(it))
      }

      const onClose = () => {
        if (!resolved) {
          resolved = true
          resolve(false)
        }

        this.logger.info('Disconnected')

        this.routes.forEach(it => it.onClose())
        this.reconnect()
      }

      const onError = ev => {
        this.logger.error(`Error occurred:`, ev)

        this.routes.forEach(r => r.endpoints.forEach(it => it.onError(ev)))
      }

      const onMessage = ev => {
        this.logger.verbose('Message on', url)

        const message = JSON.parse(ev.data) as WsMessage<object>

        this.logger.verbose('Receiving message:', message.type, message.payload)

        if (message.type === WS_TYPE_DYO_ERROR && this.errorHandler) {
          this.errorHandler(message.payload as DyoApiError)
        }

        this.routes.forEach(r => r.endpoints.forEach(it => it.onMessage(message)))
      }

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

    const result = await this.connectionAttempt
    this.connectionAttempt = null
    return result
  }

  private reconnect() {
    if (this.routes.size < 1) {
      this.logger.debug('Reconnect skipped: there is no endpoints')
      return
    }

    const route = Array.from(this.routes.values())[0]
    if (!this.socket) {
      this.logger.debug('Reconnect skipped: socket is null')
      return
    }

    if (this.socket.readyState !== WebSocket.CLOSED && this.socket.readyState !== WebSocket.CONNECTING) {
      return
    }

    const now = Date.now()
    const elapsed = now - this.lastAttempt
    if (elapsed < WS_RECONNECT_TIMEOUT) {
      setTimeout(() => this.reconnect(), WS_RECONNECT_TIMEOUT - elapsed)
      return
    }

    this.logger.debug('Reconnecting...')
    this.connect(route)
  }

  private assembleWsUrl(endpoint: string) {
    const { location } = window
    // TODO create some warning when we are in production build but the connection is insecure
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const route = `${protocol}//${location.host}${endpoint}`
    return !this.token ? route : `${route}?token=${this.token}`
  }
}

export default WebSocketClient
