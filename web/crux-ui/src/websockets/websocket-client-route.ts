import { Logger } from '@app/logger'
import { WebSocketClientSendMessage, WsConnectDto, WsMessage } from './common'
import Mutex from './mutex'
import WebSocketClientEndpoint from './websocket-client-endpoint'

type WebSocketClientRouteState = 'subscribed' | 'unsubscribed' | 'subscribing' | 'unsubscribing'

class WebSocketClientRoute {
  private logger: Logger

  private sendClientMessage: WebSocketClientSendMessage

  private lock = new Mutex()

  private freeLock: VoidFunction = null

  private state: WebSocketClientRouteState = 'unsubscribed'

  private endpoints: WebSocketClientEndpoint[] = []

  get subscribed() {
    return this.state === 'subscribed'
  }

  constructor(
    logger: Logger,
    wsSendMessage: (message: WsMessage<object>, route: WebSocketClientRoute) => boolean,
    public url: string,
  ) {
    this.logger = logger.descend(`Route - ${url}`)
    this.sendClientMessage = msg => wsSendMessage(msg, this)
  }

  forEachEndpoint(callback: (it: WebSocketClientEndpoint) => void) {
    this.endpoints.forEach(callback)
  }

  addEndpoint(endpoint: WebSocketClientEndpoint, token: string) {
    if (!this.endpoints.includes(endpoint)) {
      this.endpoints.push(endpoint)

      if (this.subscribed) {
        endpoint.onOpen(this.sendClientMessage)
      } else {
        this.subscribe(token)
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
  async subscribe(token: string): Promise<[string, string] | null> {
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
      // this is the first subscription

      const dto = (await res.json()) as WsConnectDto
      this.freeLock = free
      token = dto.token
    }

    let connectUrl = this.url
    if (res.redirected) {
      connectUrl = new URL(res.url).pathname
    }

    if (!this.freeLock) {
      // it's not the first subscription so there is no need to ws connect

      this.state = 'subscribed'
      await this.onOpen(token)
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

  async onOpen(token: string) {
    if (this.freeLock) {
      // the route was used as the first connection

      this.state = 'subscribed'
      this.logger.debug('Subscribed')

      this.freeLock()
      this.freeLock = null
    } else if (!this.subscribed && !(await this.subscribe(token))) {
      // when the socket is open but can't subscribe
      return
    }

    this.endpoints.forEach(it => it.onOpen(this.sendClientMessage))
  }

  onClose() {
    this.state = 'unsubscribed'
    this.endpoints.forEach(it => it.onClose())
  }
}

export default WebSocketClientRoute
