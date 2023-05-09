import { SubscribeMessage } from '@nestjs/websockets'
import { Observable } from 'rxjs'
import { AuthorizedHttpRequest } from 'src/app/token/jwt-auth.guard'
import { WebSocket } from 'ws'
import WsClientSetup from './client-setup'

export type WsMessage<T = any> = {
  type: string
  data: T
}

export type WsMessageWithParams<T = any> = WsMessage<T> & {
  params: Record<string, string>
}

export const WS_TYPE_ERROR = 'error'
export const WS_TYPE_AUTHORIZE = 'authorize'
export const WS_TYPE_SUBSCRIBE = 'subscribe'
export const WS_TYPE_UNSUBSCRIBE = 'unsubscribe'
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

export type SubscriptionBinder = {
  subscription: WsMessage<SubscriptionMessage>
  messages: Observable<WsMessage> | null
}

export type WsRouteMatch<Params = Record<string, string>> = {
  path: string
  subpath: string
  params: Params
}

export type MetadataInfo = {
  value: any
  callback: any
}

export type WsClientCallbacks = {
  authorize: WsCallback<WsMessageWithParams>
  subscribe: WsCallback | null
  unsubscribe: WsCallback | null
  handlers: Map<string, WsCallback>
  transform: WsTransform
}

export interface WsSubscription {
  getParameter(name: string): string
  onMessage(client: WsClient, message: WsMessage): Observable<any>
  sendToAll(message: WsMessage): void
  sendToAllExcept(except: WsClient, message: WsMessage): void
}

export type WsClient = WebSocket & {
  token: string
  setup: WsClientSetup
  connectionRequest: AuthorizedHttpRequest
  sendWsMessage: (message: WsMessage) => void
  subscriptions: Map<string, WsSubscription>
}

export type WsTransform = (data: any | Promise<any> | Observable<any>) => Observable<any>
export type WsCallback<T = WsMessage> = (message: T) => Observable<any>

export const WsAuthorize = () => SubscribeMessage(WS_TYPE_AUTHORIZE)
export const WsSubscribe = () => SubscribeMessage(WS_TYPE_SUBSCRIBE)
export const WsUnsubscribe = () => SubscribeMessage(WS_TYPE_UNSUBSCRIBE)

export const ensurePathFormat = (path: string | null): string | null => {
  if (!path) {
    return null
  }

  return path.startsWith('/') ? path : `/${path}`
}

export const namespaceOf = (message: WsMessage): string => {
  const { type } = message
  const lastSlashIndex = type.lastIndexOf('/')

  return type.substring(0, lastSlashIndex)
}

export const handlerKeyOf = (message: WsMessage): string => {
  const { type } = message
  const lastSlashIndex = type.lastIndexOf('/')
  return type.substring(lastSlashIndex + 1)
}
