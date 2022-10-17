import { Identity } from '@ory/kratos-client'
import http from 'http'
import WebSocket from 'ws'
import { WsMessage } from './common'

class WsConnection {
  readonly data: Map<string, any> = new Map()

  constructor(
    public readonly token: string,
    public readonly identity: Identity,
    public readonly address: string,
    public readonly socket: WebSocket,
    public request: http.IncomingMessage,
  ) {}

  sendWsMessage(message: WsMessage<object>) {
    if (this.socket.readyState === WebSocket.OPEN) {
      const json = JSON.stringify(message)
      this.socket.send(json)
    }
  }

  send<T extends object>(type: string, payload: T) {
    this.sendWsMessage({
      type,
      payload,
    } as WsMessage<T>)
  }
}

export default WsConnection
