import { WebSocketClientOptions, WebSocketSendMessage, WsMessage, WsMessageCallback } from './common'

class WebSocketClientEndpoint {
  private sendClientMessage: WebSocketSendMessage = null

  private callbacks: Map<string, Array<WsMessageCallback>> = new Map()

  private sendables: Array<WsMessage<object>> = []

  constructor(readonly path: string) {}

  readyStateChanged: (readyState: number) => void

  options?: WebSocketClientOptions

  setup(readyStateChanged: (readyState: number) => void, options?: WebSocketClientOptions) {
    this.readyStateChanged = readyStateChanged
    this.options = options
    this.callbacks.clear()
  }

  close() {
    this.sendClientMessage = null
    this.callbacks.clear()
    this.sendables = []
  }

  on<T = any>(type: string, callback: (message: T) => void) {
    let callbacks = this.callbacks.get(type)
    if (!callbacks) {
      callbacks = []
      this.callbacks.set(type, callbacks)
    }

    callbacks.push(callback)
  }

  sendWsMessage(message: WsMessage<object>) {
    let msg = message

    const { transformSend } = this.options ?? {}

    if (transformSend) {
      msg = transformSend(message)
      if (!msg) {
        return
      }
    }

    if (!this.sendClientMessage || !this.sendClientMessage(msg)) {
      // not connected yet
      this.sendables.push(msg)
    }
  }

  send(type: string, data: object) {
    this.sendWsMessage({
      type,
      data,
    } as WsMessage)
  }

  onMessage(message: WsMessage) {
    let msg = { ...message }

    const { transformReceive } = this.options ?? {}

    if (transformReceive) {
      msg = transformReceive(msg)
      if (!msg) {
        return
      }
    }

    this.options?.onReceive?.call(null, msg)

    const callbacks = this.callbacks.get(msg.type)
    callbacks?.forEach(it => it(msg.data))
  }

  onSubscribed(sendClientMessage: WebSocketSendMessage): void {
    this.sendClientMessage = sendClientMessage

    if (this.readyStateChanged) {
      this.readyStateChanged(WebSocket.OPEN)
    }

    if (this.options?.onOpen) {
      this.options.onOpen()
    }

    // send saved messages
    this.flushSendables()
  }

  onClose() {
    if (this.options?.onClose) {
      this.options.onClose()
    }

    if (this.readyStateChanged) {
      this.readyStateChanged(WebSocket.CLOSED)
    }
  }

  onError(ev: any) {
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
