import { DyoApiError } from '@app/models'
import { Identity } from '@ory/kratos-client'
import http, { IncomingMessage } from 'http'
import { NextApiRequest } from 'next'
import WebSocket from 'ws'

export type WsMessage<T extends object> = {
  type: string
  payload: T
}

export type WsConnectDto = {
  token?: string
}

export interface IWsEndpoint {
  readonly route: string
  readonly query: { [key: string]: string | string[] }
  readonly interests: Array<string>

  authorize(req: NextApiRequest): Promise<boolean>
  disconnect(token: string)
  onConnect(connection: IWsConnection, req: IncomingMessage)
  onDisconnect(connection: IWsConnection)
  onMessage(connection: IWsConnection, message: WsMessage<object>)
  sendAll<T extends object>(type: string, payload: T)
  sendAllExcept<T extends object>(type: string, payload: T, except: IWsConnection)
}

export type WsEndpointOptions = {
  onReady?: (endpoint: IWsEndpoint) => Promise<any>
  onAuthorize?: (endpoint: IWsEndpoint, req: NextApiRequest) => Promise<boolean>
  onMessage?: WsEndpointOnMessage
  onConnect?: (endpoint: IWsEndpoint, connection: IWsConnection, request: IncomingMessage) => void
  onDisconnect?: (endpoint: IWsEndpoint, connection: IWsConnection) => void
}

export type WsEndpointOnMessage = (
  endpoint: IWsEndpoint,
  connection: IWsConnection,
  message: WsMessage<object>,
) => Promise<any>

export interface IWsConnection {
  readonly token: string
  readonly identity: Identity
  readonly address: string
  readonly socket: WebSocket

  request: http.IncomingMessage
  endpoints: Set<IWsEndpoint>
  data: Map<string, any>

  sendWsMessage(message: WsMessage<object>)
  send<T extends object>(type: string, payload: T)
}

export type WsMessageCallback<T extends any> = (message: T) => void

export type WsErrorHandler = (message: DyoApiError) => void

export type WebSocketClientOptions = {
  onOpen?: VoidFunction
  onClose?: VoidFunction
  onSend?: (message: WsMessage<any>) => void
  onReceive?: (message: WsMessage<any>) => void
  onError?: (error: any) => void
}

export interface IWebSocketRoute {
  url: string
  subscribed: boolean
  endpoints: IWebSocketEndpoint[]

  kill()
  onOpen(client: IWebSocketClient)
  onClose()
}

export interface IWebSocketClient {
  register(endpoint: IWebSocketEndpoint): Promise<boolean>
  remove(url: string, endpoint: IWebSocketEndpoint)
  close()
  sendWsMessage(message: WsMessage<object>, url: string): boolean
  subscribeToRoute(url: string): Promise<string>
  setErrorHandler(handler: WsErrorHandler)
}

export interface IWebSocketEndpoint {
  readonly url: string
  options?: WebSocketClientOptions

  readyStateChanged: (readyState: number) => void
  setup(readyStateChanged: (readyState: number) => void, options?: WebSocketClientOptions)
  close()
  kill()
  on<T extends object>(type: string, callback: (message: T) => void)
  sendWsMessage(message: WsMessage<object>)
  send(type: string, payload: object)
  onMessage(message: WsMessage<object>)
  onOpen(client: IWebSocketClient)
  onClose()
  onError(ev)
}
