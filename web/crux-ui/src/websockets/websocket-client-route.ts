import { Logger } from '@app/logger'
import { SubscriptionMessage, SubscriptionMessageType, WebSocketSendMessage, WsMessage } from './common'
import WebSocketClientEndpoint from './websocket-client-endpoint'

type WebSocketClientRouteState = 'subscribed' | 'unsubscribed' | 'in-progress'

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
    // closing connection

    this.state = 'unsubscribed'
    this.endpoints.forEach(it => it.close())
    this.endpoints = []
  }

  subscribe(endpoint: WebSocketClientEndpoint) {
    if (!this.endpoints.includes(endpoint)) {
      this.endpoints.push(endpoint)
    }

    if (this.state === 'subscribed') {
      // we are already subscribed

      endpoint.onSubscribed(this.sendClientMessage)
      return
    }

    if (this.state !== 'unsubscribed') {
      // we are in between states
      return
    }

    this.sendSubscriptionMessage('subscribe')
  }

  /**
   * returns if it should be removed
   */
  unsubscribe(endpoint: WebSocketClientEndpoint): boolean {
    this.endpoints = this.endpoints.filter(it => it !== endpoint)

    if (this.endpoints.length > 0) {
      // we have endpoints, we should not unsubscribe

      return false
    }

    if (this.state === 'unsubscribed') {
      // we are not subscribed, the route can be safely removed

      return true
    }

    if (this.state !== 'subscribed') {
      // were in between states, so we wait for the subscription result
      return false
    }

    this.sendSubscriptionMessage('unsubscribe')
    return false
  }

  onSubscribed() {
    this.logger.debug('Subscribed')

    this.state = 'subscribed'

    if (this.endpoints.length < 1) {
      // we should not be subscribed as there are no endpoints

      this.sendSubscriptionMessage('unsubscribe')
      return
    }

    this.endpoints.forEach(it => it.onSubscribed(this.sendClientMessage))
  }

  /**
   * returns if it should be removed
   */
  onUnsubscribed(): boolean {
    this.logger.debug('Unsubscribed')

    this.state = 'unsubscribed'

    if (this.endpoints.length > 0) {
      // we should be subscribed as we have endpoints

      this.sendSubscriptionMessage('subscribe')
      return false
    }

    return true
  }

  onRedirect(redirect: string) {
    this.logger.debug('Redirected to ', redirect)

    // save the original url
    this.redirect = this.endpointPath
    this.endpointPath = redirect

    // repeate the subscription message with the correct path
    this.sendSubscriptionMessage('subscribe')
  }

  onMessage(message: WsMessage) {
    if (!message.type.startsWith(this.path)) {
      // it's not for this route

      return
    }

    // strip the basepath
    message.type = message.type.substring(this.path.length + 1)

    // notify the endpoints
    this.endpoints.forEach(it => it.onMessage(message))
  }

  onError(ev: any) {
    this.endpoints.forEach(it => it.onError(ev))
  }

  onSocketOpen() {
    // the connection is ready

    this.sendSubscriptionMessage('subscribe')
  }

  onSocketClose() {
    // connection lost
    this.state = 'unsubscribed'
    this.endpoints.forEach(it => it.onClose())
  }

  private sendSubscriptionMessage(type: SubscriptionMessageType): void {
    this.state = 'in-progress'

    const msg: WsMessage<SubscriptionMessage> = {
      type,
      data: {
        path: this.path,
      },
    }

    if (!this.sendMessage(msg)) {
      this.logger.verbose('Failed to send subscription message', this.state, '-> unsubscribed')
      this.state = 'unsubscribed'
    }
  }
}

export default WebSocketClientRoute
