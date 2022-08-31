import { IWebSocketClient, IWebSocketEndpoint, IWebSocketRoute } from './common'

class WebSocketRoute implements IWebSocketRoute {
  subscribed = false

  endpoints: IWebSocketEndpoint[] = []

  constructor(public url: string) {}

  kill() {
    this.endpoints.forEach(it => it.kill())
    this.endpoints = []
  }

  async onOpen(client: IWebSocketClient) {
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

export default WebSocketRoute
