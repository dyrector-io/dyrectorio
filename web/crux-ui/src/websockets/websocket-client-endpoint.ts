import { WebSocketClientOptions, WebSocketClientSendMessage, WsMessage, WsMessageCallback } from './common'

class WebSocketClientEndpoint {
  private sendClientMessage: WebSocketClientSendMessage = null

  private callbacks: Map<string, Array<WsMessageCallback<object>>> = new Map()

  private sendables: Array<WsMessage<object>> = []

  constructor(readonly url: string) {}

  readyStateChanged: (readyState: number) => void

  options?: WebSocketClientOptions

  setup(readyStateChanged: (readyState: number) => void, options?: WebSocketClientOptions) {
    this.readyStateChanged = readyStateChanged
    this.options = options
    this.callbacks.clear()
  }

  kill() {
    this.sendClientMessage = null
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
    if (!this.sendClientMessage || !this.sendClientMessage(message)) {
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

  onOpen(sendClientMessage: WebSocketClientSendMessage): void {
    this.sendClientMessage = sendClientMessage

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

export default WebSocketClientEndpoint
