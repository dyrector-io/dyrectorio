import { WS_TYPE_DYO_ERROR } from '@app/models'
import { WsMessage } from '@app/websockets/common'
import { WsConnection, WsEndpoint } from '@app/websockets/server'
import { Logger } from '../logger'
import { DyoApiError, internalError, isDyoApiError } from './error-middleware'

export const useWebsocketErrorMiddleware = async (
  logger: Logger,
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<object>,
  next: () => Promise<void>,
): Promise<void> => {
  try {
    await next()
  } catch (e) {
    if (isDyoApiError(e) && e.status < 500) {
      const error = e as DyoApiError
      connection.send(WS_TYPE_DYO_ERROR, error)
    } else {
      logger.error('Internal Server Error: ', e)
      connection.send(WS_TYPE_DYO_ERROR, internalError('Internal error.'))
    }
  }
}
