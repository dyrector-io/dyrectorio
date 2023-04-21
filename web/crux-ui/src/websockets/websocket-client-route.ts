import { Logger } from '@app/logger'
import { SubscriptionMessage, SubscriptionMessageType, WebSocketSendMessage, WsMessage } from './common'
import WebSocketClientEndpoint from './websocket-client-endpoint'

type WebSocketClientRouteState = 'subscribed' | 'unsubscribed' | 'subscribing' | 'unsubscribing'

class WebSocketClientRoute {
  private logger: Logger

  private readonly sendClientMessage: WebSocketSendMessage

  private state: WebSocketClientRouteState = 'unsubscribed'

  private endpoints: WebSocketClientEndpoint[] = []

  private redirect: string | null = null

  get path(): string {
    return this.endpointPath
  }

  get redirectedFrom(): string | null {
    return this.redirect
  }

  constructor(logger: Logger, private readonly sendMessage: WebSocketSendMessage, private endpointPath: string) {
    this.logger = logger.descend(endpointPath)
    this.sendClientMessage = msg => {
      this.endpoints.forEach(it => it.options?.onSend?.call(null, msg))

      return sendMessage({
        type: `${this.path}/${msg.type}`,
        data: msg.data,
      })
    }
  }

  clear() {
    this.state = 'unsubscribed'
    this.endpoints.forEach(it => it.kill())
    this.endpoints = []
  }

  subscribe(endpoint: WebSocketClientEndpoint) {
    if (this.endpoints.includes(endpoint)) {
      return
    }

    this.endpoints.push(endpoint)

    if (this.state === 'subscribed') {
      endpoint.onSubscribed(this.sendClientMessage)
      return
    }

    if (this.state !== 'unsubscribed') {
      return
    }

    this.sendSubscriptionMessage('subscribe')
  }

  unsubscribe(endpoint: WebSocketClientEndpoint): boolean {
    this.endpoints = this.endpoints.filter(it => it !== endpoint)

    if (this.endpoints.length > 0) {
      return false
    }

    if (this.state === 'unsubscribed') {
      return true
    }

    if (this.state !== 'subscribed') {
      // were in between states
      return false
    }

    this.sendSubscriptionMessage('unsubscribe')
    return false
  }

  onSubscribed() {
    this.logger.debug('Subscribed')

    if (this.endpoints.length < 1) {
      this.sendSubscriptionMessage('unsubscribe')
      return
    }

    this.state = 'subscribed'

    this.endpoints.forEach(it => it.onSubscribed(this.sendClientMessage))
  }

  /**
   * returns if it should be removed
   */
  onUnsubscribed(): boolean {
    this.logger.debug('Unsubscribed')

    if (this.endpoints.length > 0) {
      this.sendSubscriptionMessage('subscribe')
      return false
    }

    this.state = 'unsubscribed'
    return true
  }

  onRedirect(redirect: string) {
    this.logger.debug('Redirected to ', redirect)

    this.redirect = this.endpointPath
    this.endpointPath = redirect
    this.sendSubscriptionMessage('subscribe')
  }

  onMessage(message: WsMessage) {
    if (!message.type.startsWith(this.path)) {
      return
    }

    console.log('on msg', this.endpoints.length)
    message.type = message.type.substring(this.path.length + 1)
    this.endpoints.forEach(it => it.onMessage(message))
  }

  onError(ev: any) {
    this.endpoints.forEach(it => it.onError(ev))
  }

  /**
   * returns if it should be removed
   */
  onSocketOpen() {
    this.sendSubscriptionMessage('subscribe')
  }

  onSocketClose() {
    this.state = 'unsubscribed'
    this.endpoints.forEach(it => it.onClose())
  }

  private sendSubscriptionMessage(type: SubscriptionMessageType): void {
    this.state = type === 'subscribe' ? 'subscribing' : 'unsubscribing'

    const msg: WsMessage<SubscriptionMessage> = {
      type,
      data: {
        path: this.path,
      },
    }

    if (!this.sendMessage(msg)) {
      this.state = 'unsubscribed'
    }
  }
}

export default WebSocketClientRoute
