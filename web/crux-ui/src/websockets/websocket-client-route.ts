import { WebSocketClientSendMessage } from './common'
import WebSocketClientEndpoint from './websocket-client-endpoint'

class WebSocketClientRoute {
  subscribed = false

  endpoints: WebSocketClientEndpoint[] = []

  constructor(public url: string) {}

  kill() {
    this.endpoints.forEach(it => it.kill())
    this.endpoints = []
  }

  async onOpen(url: string, sendClientMessage: WebSocketClientSendMessage) {
    if (!this.subscribed) {
      this.subscribed = !!url
    }

    this.endpoints.forEach(it => it.onOpen(sendClientMessage))
  }

  onClose() {
    this.subscribed = false
    this.endpoints.forEach(it => it.onClose())
  }
}

export default WebSocketClientRoute
