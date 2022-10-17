import { AsyncVoidFunction } from '@app/utils'
import { WsMessage } from '@app/websockets/common'
import WsConnection from '@app/websockets/connection'
import WsEndpoint from '@app/websockets/endpoint'
import { Logger } from '../logger'

export type WsMiddleWareFunction = (
  logger: Logger,
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<object>,
  next: AsyncVoidFunction,
) => Promise<void>

export const useWebsocketMiddlewares = async (
  logger: Logger,
  middlewares: WsMiddleWareFunction[],
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<object>,
  next: AsyncVoidFunction,
) => {
  if (middlewares.length < 1) {
    await next()
    return
  }

  let i = 0

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const callNext = async () => (i < middlewares.length ? await callNextMiddleware() : await next())

  const callNextMiddleware = async () => await middlewares[i++](logger, endpoint, connection, message, callNext)

  await callNextMiddleware()
}
