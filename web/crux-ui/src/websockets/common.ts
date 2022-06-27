export type WsMessage<T extends object> = {
  type: string
  payload: T
}

export type WsConnectDto = {
  token?: string
}
