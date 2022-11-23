import { Logger } from '@app/logger'
import { WebSocketClientSendMessage, WsConnectDto } from './common'
import Mutex from './mutex'
import WebSocketClientEndpoint from './websocket-client-endpoint'

type WebSocketClientRouteState = 'subscribed' | 'unsubscribed' | 'subscribing' | 'unsubscribing'

class WebSocketClientRoute {
  private logger: Logger

  private lock = new Mutex()

  private freeLock: VoidFunction = null

  private state: WebSocketClientRouteState = 'unsubscribed'

  private endpoints: WebSocketClientEndpoint[] = []

  get subscribed() {
    return this.state === 'subscribed'
  }

  constructor(logger: Logger, public url: string) {
    this.logger = logger.descend(`Route - ${url}`)
  }

  forEachEndpoint(callback: (it: WebSocketClientEndpoint) => void) {
    this.endpoints.forEach(callback)
  }

  addEndpoint(endpoint: WebSocketClientEndpoint, sendClientMessage: WebSocketClientSendMessage, token: string) {
    if (!this.endpoints.includes(endpoint)) {
      this.endpoints.push(endpoint)

      if (this.subscribed) {
        endpoint.onOpen(sendClientMessage)
      } else {
        this.subscribe(sendClientMessage, token)
      }
    }
  }

  kill() {
    this.endpoints.forEach(it => it.kill())
    this.endpoints = []
  }

  /**
   * @param token existing token
   * @returns [newToken, connectUrl] or null
   */
  async subscribe(sendClientMessage: WebSocketClientSendMessage, token: string): Promise<[string, string] | null> {
    if (this.state === 'subscribed') {
      return [token, null]
    }

    const free = await this.lock.aquire()
    this.state = 'subscribing'

    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    const res = await fetch(this.url, {
      method: 'POST',
      headers: !token
        ? defaultHeaders
        : {
            ...defaultHeaders,
            Authorization: token,
          },
    })

    if (!res.ok) {
      this.logger.debug('Failed to subscribe')
      this.state = 'unsubscribed'
      free()
      return null
    }

    if (res.status === 200) {
      const dto = (await res.json()) as WsConnectDto
      this.freeLock = free
      token = dto.token
    }

    let connectUrl = this.url
    if (res.redirected) {
      connectUrl = new URL(res.url).pathname
    }

    if (!this.freeLock) {
      this.state = 'subscribed'
      await this.onOpen(sendClientMessage, token)
      free()
    }

    return [token, connectUrl]
  }

  /**
   * @param endpoint
   * @returns true when should remove the route
   */
  async unsubscribe(endpoint: WebSocketClientEndpoint, token: string): Promise<boolean> {
    this.endpoints = this.endpoints.filter(it => it !== endpoint)

    if (this.endpoints.length > 0) {
      return false
    }

    if (this.state === 'unsubscribed') {
      return this.endpoints.length < 0
    }

    this.state = 'unsubscribing'

    const free = await this.lock.aquire()

    await fetch(this.url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })

    this.state = 'unsubscribed'
    free()

    this.logger.debug('Unsubscribed')

    return this.endpoints.length < 1
  }

  async onOpen(sendClientMessage: WebSocketClientSendMessage, token: string) {
    if (this.freeLock) {
      this.state = 'subscribed'
      this.logger.debug('Subscribed')
      this.freeLock()
      this.freeLock = null
    } else if (!this.subscribed) {
      if (!(await this.subscribe(sendClientMessage, token))) {
        return
      }
    }

    this.endpoints.forEach(it => it.onOpen(sendClientMessage))
  }

  onClose() {
    this.state = 'unsubscribed'
    this.endpoints.forEach(it => it.onClose())
  }
}

export default WebSocketClientRoute
