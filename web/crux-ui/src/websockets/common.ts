import { DyoApiError } from '@app/models'

export type WsMessage<T extends object> = {
  type: string
  payload: T
}

export type WsConnectDto = {
  token?: string
}

export type WsMessageCallback<T extends any> = (message: T) => void

export type WsErrorHandler = (message: DyoApiError) => void

export type WebSocketClientSendMessage = (message: WsMessage<object>) => boolean

export type WebSocketClientOptions = {
  onOpen?: VoidFunction
  onClose?: VoidFunction
  onSend?: (message: WsMessage<any>) => void
  onReceive?: (message: WsMessage<any>) => void
  onError?: (error: any) => void
  transformReceive?: (message: WsMessage<any>) => WsMessage<any>
  transformSend?: (message: WsMessage<any>) => WsMessage<any>
}
