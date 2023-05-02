import { WsErrorMessage } from '@app/models'

export type WsMessage<T = any> = {
  type: string
  data: T
}

export const WS_TYPE_SUBSCRIBE = 'subscribe'
export const WS_TYPE_UNSUBSCRIBE = 'unsubscribe'
const SUBSCRIPTION_MESSAGE_TYPE_VALUES = [WS_TYPE_SUBSCRIBE, WS_TYPE_UNSUBSCRIBE] as const
export type SubscriptionMessageType = typeof SUBSCRIPTION_MESSAGE_TYPE_VALUES[number]

export const WS_TYPE_SUBBED = 'subbed'
export const WS_TYPE_SUB_FAILED = 'sub-failed'
export const WS_TYPE_UNSUBBED = 'unsubbed'
export const WS_TYPE_SUB_REDIRECT = 'sub-redirect'
export type SubscriptionMessage = {
  path: string
}

export type SubscriptionRedirectMessage = SubscriptionMessage & {
  redirect: string
}

export type WsConnectDto = {
  token?: string
}

export type WsMessageCallback<T = any> = (message: T) => void

export type WsErrorHandler = (message: WsErrorMessage) => void

export type WebSocketSendMessage = (message: WsMessage) => boolean

export type WebSocketClientOptions = {
  onOpen?: VoidFunction
  onClose?: VoidFunction
  onSend?: (message: WsMessage<any>) => void
  onReceive?: (message: WsMessage<any>) => void
  onError?: (error: any) => void
  transformReceive?: (message: WsMessage<any>) => WsMessage<any>
  transformSend?: (message: WsMessage<any>) => WsMessage<any>
}
