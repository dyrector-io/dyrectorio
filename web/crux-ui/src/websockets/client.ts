import { WS_RECONNECT_TIMEOUT } from '@app/const'
import { Logger } from '@app/logger'
import { WsConnectDto, WsMessage } from './common'

export type WsMessageCallback<T extends any> = (message: T) => void

export type WebSocketClientOptions = {
  onOpen?: VoidFunction
  onClose?: VoidFunction
  onSend?: (message: WsMessage<any>) => void
  onReceive?: (message: WsMessage<any>) => void
  onError?: (error: any) => void
}

export class WebSocketEndpoint {
  private client: WebSocketClient
  private callbacks: Map<string, Array<WsMessageCallback<object>>> = new Map()
  private sendables: Array<WsMessage<object>> = []

  constructor(private url: string) {}

  readyStateChanged: (readyState: number) => void
  options?: WebSocketClientOptions

  setup(readyStateChanged: (readyState: number) => void, options?: WebSocketClientOptions) {
    this.readyStateChanged = readyStateChanged
    this.options = options
    this.callbacks.clear()
  }

  async close() {
    if (this.client) {
      await this.client.remove(this.url, this)
      this.kill()
    }
  }

  kill() {
    this.client = null
    this.callbacks = new Map()
    this.sendables = []
  }

  on<T extends object>(type: string, callback: (message: T) => void) {
    let callbacks = this.callbacks.get(type)
    if (!callbacks) {
      callbacks = []
      this.callbacks.set(type, callbacks)
    }

    callbacks.push(callback)
  }

  sendWsMessage(message: WsMessage<object>) {
    if (!this.client || !this.client.sendWsMessage(message, this.url)) {
      this.sendables.push(message)
    }
  }

  send(type: string, payload: object) {
    this.sendWsMessage({
      type,
      payload,
    } as WsMessage<object>)
  }

  onMessage(message: WsMessage<object>) {
    this.options?.onReceive?.call(null, message)

    const callbacks = this.callbacks.get(message.type)
    callbacks?.forEach(it => it(message.payload))
  }

  onOpen(client: WebSocketClient) {
    this.client = client

    if (this.options?.onOpen) {
      this.options.onOpen()
    }

    this.flushSendables()
  }

  onClose() {
    if (this.options?.onClose) {
      this.options.onClose()
    }
  }

  onError(ev) {
    if (this.options?.onError) {
      this.options.onError(ev)
    }
  }

  private flushSendables() {
    if (this.sendables.length > 0) {
      this.sendables.forEach(it => this.sendWsMessage(it))
      this.sendables = []
    }
  }
}

export class WebSocketRoute {
  subscribed = false
  endpoints: WebSocketEndpoint[] = []

  constructor(public url: string) {}

  kill() {
    this.endpoints.forEach(it => it.kill())
    this.endpoints = []
  }

  async onOpen(client: WebSocketClient) {
    if (!this.subscribed) {
      const url = await client.subscribeToRoute(this.url)
      this.subscribed = !!url
    }

    this.endpoints.forEach(it => it.onOpen(client))
  }

  onClose() {
    this.subscribed = false
    this.endpoints.forEach(it => it.onClose())
  }
}

export class WebSocketClient {
  private logger = new Logger(WebSocketClient.name)
  private socket?: WebSocket
  private connectionAttempt?: Promise<boolean>
  private lastAttempt = 0
  private token?: string
  private unsubscribe?: VoidFunction
  private routes: Map<string, WebSocketRoute> = new Map()

  async register(url: string, endpoint: WebSocketEndpoint): Promise<boolean> {
    let route = this.routes.get(url)
    if (!route) {
      route = new WebSocketRoute(url)
      this.routes.set(url, route)
    }
    const connected = await this.connect(route)
    if (!route.endpoints.includes(endpoint)) {
      route.endpoints.push(endpoint)
    }

    if (connected) {
      if (route.subscribed) {
        endpoint.onOpen(this)
      } else {
        route.onOpen(this)
      }
    }

    return connected
  }

  async remove(url: string, endpoint: WebSocketEndpoint) {
    this.logger.debug('Disconnecting:', url)

    let route = this.routes.get(url)
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
    } else {
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
  }

  private async connect(route: WebSocketRoute): Promise<boolean> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return true
    }

    if (this.connectionAttempt && (await this.connectionAttempt)) {
      return true
    }

    this.lastAttempt = Date.now()
    this.connectionAttempt = new Promise<boolean>(async resolve => {
      this.token = null

      this.unsubscribe?.call(this)

      const url = await this.subscribeToRoute(route.url)
      route.subscribed = !!url
      if (!route.subscribed) {
        return false
      }

      let resolved = false
      this.socket = new WebSocket(this.assembleWsUrl(url))

      const onOpen = () => {
        if (!resolved) {
          resolved = true
          resolve(true)
        }

        this.logger.info('Connected')
        this.routes.forEach(it => it.onOpen(this))
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

        this.routes.forEach(route => route.endpoints.forEach(it => it.onError(ev)))
      }

      const onMessage = ev => {
        this.logger.verbose('Message on', url)

        const message = JSON.parse(ev.data) as WsMessage<object>

        this.logger.verbose('Receiving message:', message.type)
        this.logger.verbose('Content:', message.payload)

        this.routes.forEach(route => route.endpoints.forEach(it => it.onMessage(message)))
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
    const location = window.location
    // TODO create some warning when we are in production build but the connection is insecure
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const route = `${protocol}//${location.host}${endpoint}`
    return !this.token ? route : `${route}?token=${this.token}`
  }
}
